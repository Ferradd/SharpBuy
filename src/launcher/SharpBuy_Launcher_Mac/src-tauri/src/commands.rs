use crate::accounts::{self, SavedAccount};
use crate::api;
use crate::steam;
use serde_json::json;
use std::time::{Duration, Instant};
use tauri::{LogicalSize, Size, AppHandle, WebviewWindow};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

fn set_logical_size(window: &WebviewWindow, width: u32, height: u32) -> Result<(), String> {
    window
        .set_size(Size::Logical(LogicalSize::new(width as f64, height as f64)))
        .map_err(|e| e.to_string())
}

fn logical_outer_size(window: &WebviewWindow) -> Result<(f64, f64), String> {
    let scale = window.scale_factor().map_err(|e| e.to_string())?;
    let outer = window.outer_size().map_err(|e| e.to_string())?;
    Ok((outer.width as f64 / scale, outer.height as f64 / scale))
}

#[tauri::command]
pub fn get_steam_path() -> String {
    steam::get_steam_path()
}

#[tauri::command]
pub fn get_saved_accounts() -> String {
    accounts::get_saved_accounts_json()
}

#[tauri::command]
pub fn check_token(raw_token: String) -> String {
    let p = steam::parse_token(&raw_token);
    json!({
        "valid": p.valid,
        "secondsRemaining": p.seconds_remaining,
        "steamId": p.steam_id,
        "accountName": p.account_name,
    })
    .to_string()
}

#[tauri::command]
pub async fn launch_steam(token_input: String) -> String {
    let result = steam::inject_token_and_launch(&token_input);
    if result.success {
        let parsed = steam::parse_token(&token_input);
        let _ = api::save_account_from_token(
            &result.steam_id,
            &result.account_name,
            &token_input,
            &parsed,
        )
        .await;
    }
    serde_json::to_string(&result).unwrap_or_else(|_| {
        json!({"success": false, "message": "serialization error", "steamId": "", "accountName": ""}).to_string()
    })
}

#[tauri::command]
pub async fn check_account_live_async(raw_token: String, steam_id: String) -> String {
    api::check_account_live(&raw_token, &steam_id).await
}

#[tauri::command]
pub async fn get_account_library_async(raw_token: String) -> String {
    api::get_account_library(&raw_token).await
}

#[tauri::command]
pub async fn save_account(steam_id: String, account_name: String, token: String) -> Result<(), String> {
    let parsed = steam::parse_token(&token);
    api::save_account_from_token(&steam_id, &account_name, &token, &parsed).await
}

#[tauri::command]
pub async fn refresh_all_warranties_async() -> bool {
    api::refresh_all_warranties().await
}

#[tauri::command]
pub async fn refresh_all_profiles_async() -> bool {
    api::refresh_all_profiles().await
}

#[tauri::command]
pub fn delete_saved_account(steam_id: String) -> Result<(), String> {
    accounts::delete_account(&steam_id)
}

#[tauri::command]
pub fn clear_all_saved_accounts() -> Result<(), String> {
    accounts::clear_all()
}

#[tauri::command]
pub async fn import_tokens_from_file_async(app: AppHandle) -> String {
    let (tx, rx) = tokio::sync::oneshot::channel();
    app.dialog()
        .file()
        .add_filter("Text", &["txt", "log", "csv"])
        .pick_file(move |picked| {
            let _ = tx.send(picked);
        });

    let Some(path) = rx.await.unwrap_or(None) else {
        return json!({ "success": false, "cancelled": true }).to_string();
    };

    let path = match path.into_path() {
        Ok(p) => p,
        Err(_) => return json!({ "success": false, "error": "Invalid file path" }).to_string(),
    };
    let Ok(file_content) = std::fs::read_to_string(&path) else {
        return json!({ "success": false, "error": "Could not read file" }).to_string();
    };

    let re = steam::token_regex();
    let mut tokens = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for cap in re.find_iter(&file_content) {
        let t = cap.as_str();
        if seen.insert(t.to_string()) {
            tokens.push(t.to_string());
        }
    }

    if tokens.is_empty() {
        return json!({
            "success": false,
            "error": "No Steam tokens found. Expected: 7656119XXXXXXXXX----ey..."
        })
        .to_string();
    }

    let mut list = accounts::load_accounts();
    let mut existing: std::collections::HashSet<String> =
        list.iter().map(|a| a.steam_id.clone()).collect();
    let mut imported = 0u32;
    let mut skipped = 0u32;

    for token in tokens {
        let parsed = steam::parse_token(&token);
        if !parsed.valid {
            skipped += 1;
            continue;
        }
        if existing.contains(&parsed.steam_id) {
            skipped += 1;
            continue;
        }

        let full_token = if token.contains("----") {
            token.clone()
        } else {
            format!("{}----{}", parsed.steam_id, token)
        };

        let profile = api::fetch_steam_profile(&parsed.steam_id).await;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        list.insert(
            0,
            SavedAccount {
                steam_id: parsed.steam_id.clone(),
                account_name: parsed.account_name.clone(),
                persona_name: profile.persona,
                avatar_url: profile.avatar,
                token: full_token,
                added_at: now,
                warranty_expires_at: 0,
                exp_seconds: parsed.seconds_remaining,
                last_checked_at: 0,
                is_alive: true,
                status_message: "Imported".to_string(),
                vac_banned: profile.vac,
            },
        );
        existing.insert(parsed.steam_id);
        imported += 1;
        if list.len() >= accounts::MAX_ACCOUNTS {
            break;
        }
    }

    if accounts::save_accounts(&list).is_err() {
        return json!({ "success": false, "error": "Failed to save accounts" }).to_string();
    }

    json!({
        "success": true,
        "imported": imported,
        "skipped": skipped,
        "totalFound": imported + skipped,
        "inHistory": list.len()
    })
    .to_string()
}

#[tauri::command]
pub fn reset_steam() -> bool {
    steam::reset_steam_data()
}

#[tauri::command]
pub fn clear_all_steam_sessions() -> bool {
    steam::clear_all_steam_sessions()
}

#[tauri::command]
pub fn kill_steam() {
    steam::kill_steam_processes();
}

#[tauri::command]
pub fn open_steam_dir(app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_path(steam::steam_data_dir().to_string_lossy(), None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_browser(app: AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn change_path(app: AppHandle) -> Option<String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    app.dialog().file().pick_folder(move |picked| {
        let _ = tx.send(picked);
    });
    
    let picked = rx.await.unwrap_or(None)?;
    let path = picked.into_path().ok()?;
    let path_str = path.to_string_lossy().to_string();
    steam::set_steam_path(path_str.clone());
    Some(path_str)
}

#[tauri::command]
pub fn set_window_size(window: WebviewWindow, width: u32, height: u32) -> Result<(), String> {
    set_logical_size(&window, width, height)
}

#[tauri::command]
pub async fn set_window_size_animated(
    window: WebviewWindow,
    width: u32,
    height: u32,
    duration_ms: u32,
) -> Result<(), String> {
    let (start_w, start_h) = logical_outer_size(&window)?;
    let target_w = width as f64;
    let target_h = height as f64;
    let duration = Duration::from_millis(u64::from(duration_ms.max(1)));
    let started = Instant::now();

    loop {
        let elapsed = started.elapsed();
        let t = if elapsed >= duration {
            1.0
        } else {
            let x = elapsed.as_secs_f64() / duration.as_secs_f64();
            if x < 0.5 {
                2.0 * x * x
            } else {
                1.0 - (-2.0 * x + 2.0).powi(2) / 2.0
            }
        };

        let w = start_w + (target_w - start_w) * t;
        let h = start_h + (target_h - start_h) * t;
        window
            .set_size(Size::Logical(LogicalSize::new(w, h)))
            .map_err(|e| e.to_string())?;

        if t >= 1.0 {
            break;
        }
        tokio::time::sleep(Duration::from_millis(16)).await;
    }

    set_logical_size(&window, width, height)
}

#[tauri::command]
pub fn minimize(window: WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minimize_animated(window: WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn close_app(window: WebviewWindow) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn start_drag(window: WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn on_drag_window() {}
