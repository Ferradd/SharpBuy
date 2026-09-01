use crate::accounts::SavedAccount;
use regex::Regex;
use serde_json::json;

const API_BASE: &str = "https://sharpbuy.org/api";
const DEFAULT_AVATAR: &str =
    "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg";

pub struct SteamProfile {
    pub persona: String,
    pub avatar: String,
    pub vac: String,
}

pub async fn http_post_json(url: &str, body: &serde_json::Value) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(45))
        .build()
        .map_err(|e| e.to_string())?;
    client
        .post(url)
        .json(body)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())
}

pub async fn fetch_steam_profile(steam_id: &str) -> SteamProfile {
    if steam_id.len() < 10 {
        return SteamProfile {
            persona: steam_id.to_string(),
            avatar: DEFAULT_AVATAR.to_string(),
            vac: "0".to_string(),
        };
    }

    let url = format!("https://steamcommunity.com/profiles/{steam_id}?xml=1");
    let xml = match reqwest::get(&url).await {
        Ok(r) => match r.text().await {
            Ok(t) => t,
            Err(_) => {
                return SteamProfile {
                    persona: steam_id.to_string(),
                    avatar: DEFAULT_AVATAR.to_string(),
                    vac: "0".to_string(),
                };
            }
        },
        Err(_) => {
            return SteamProfile {
                persona: steam_id.to_string(),
                avatar: DEFAULT_AVATAR.to_string(),
                vac: "0".to_string(),
            };
        }
    };

    let name = Regex::new(r"<steamID><!\[CDATA\[(.*?)\]\]></steamID>")
        .ok()
        .and_then(|re| re.captures(&xml))
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| steam_id.to_string());

    let avatar = Regex::new(r"<avatarMedium><!\[CDATA\[(.*?)\]\]></avatarMedium>")
        .ok()
        .and_then(|re| re.captures(&xml))
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| DEFAULT_AVATAR.to_string());

    let vac = Regex::new(r"<vacBanned>(\d+)</vacBanned>")
        .ok()
        .and_then(|re| re.captures(&xml))
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "0".to_string());

    SteamProfile {
        persona: name,
        avatar,
        vac,
    }
}

pub async fn save_account_from_token(
    steam_id: &str,
    account_name: &str,
    token_input: &str,
    parsed: &crate::steam::ParsedToken,
) -> Result<(), String> {
    let full_token = if token_input.contains("----") {
        token_input.to_string()
    } else {
        format!("{}----{}", parsed.steam_id, token_input)
    };

    let profile = fetch_steam_profile(steam_id).await;
    let now = chrono_now();

    crate::accounts::upsert_account(SavedAccount {
        steam_id: steam_id.to_string(),
        account_name: if account_name.is_empty() {
            parsed.account_name.clone()
        } else {
            account_name.to_string()
        },
        persona_name: profile.persona,
        avatar_url: profile.avatar,
        token: full_token,
        added_at: now,
        warranty_expires_at: 0,
        exp_seconds: parsed.seconds_remaining,
        last_checked_at: 0,
        is_alive: true,
        status_message: String::new(),
        vac_banned: profile.vac,
    })
}

pub async fn check_account_live(raw_token: &str, steam_id: &str) -> String {
    match http_post_json(
        &format!("{API_BASE}/steam-verify"),
        &json!({ "token": raw_token, "steamId": steam_id }),
    )
    .await
    {
        Ok(s) => s,
        Err(e) => json!({ "isAlive": false, "reason": e }).to_string(),
    }
}

pub async fn get_account_library(raw_token: &str) -> String {
    match http_post_json(
        &format!("{API_BASE}/account-library"),
        &json!({ "token": raw_token }),
    )
    .await
    {
        Ok(s) => s,
        Err(e) => json!({ "error": e, "games": [] }).to_string(),
    }
}

pub async fn refresh_all_warranties() -> bool {
    let mut list = crate::accounts::load_accounts();
    let mut changed = false;
    for acc in list.iter_mut() {
        if let Ok(res) = http_post_json(
            &format!("{API_BASE}/warranty-check"),
            &json!({ "token": acc.token }),
        )
        .await
        {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&res) {
                if let Some(exp) = v.get("expiresAtUnix").and_then(|x| x.as_i64()) {
                    acc.warranty_expires_at = exp;
                    changed = true;
                }
            }
        }
    }
    if changed {
        let _ = crate::accounts::save_accounts(&list);
    }
    changed
}

pub async fn refresh_all_profiles() -> bool {
    let mut list = crate::accounts::load_accounts();
    let mut changed = false;
    for acc in list.iter_mut() {
        let p = fetch_steam_profile(&acc.steam_id).await;
        if p.persona != acc.persona_name || p.avatar != acc.avatar_url {
            acc.persona_name = p.persona;
            acc.avatar_url = p.avatar;
            acc.vac_banned = p.vac;
            changed = true;
        }
    }
    if changed {
        let _ = crate::accounts::save_accounts(&list);
    }
    changed
}

fn chrono_now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}
