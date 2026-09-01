mod accounts;
mod api;
mod commands;
mod steam;

use tauri::{LogicalSize, Manager, Size, TitleBarStyle};

const WIDTH_NORMAL: f64 = 600.0;
const HEIGHT_NORMAL: f64 = 440.0;
const WIDTH_DRAWER: f64 = 980.0;
const HEIGHT_PASSPORT: f64 = 580.0;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                {
                    let _ = window.set_title_bar_style(TitleBarStyle::Overlay);
                }

                // Lock user resize; UI resizes programmatically (history drawer, passport).
                let _ = window.set_resizable(false);
                let _ = window.set_min_size(Some(Size::Logical(LogicalSize::new(
                    WIDTH_NORMAL,
                    HEIGHT_NORMAL,
                ))));
                let _ = window.set_max_size(Some(Size::Logical(LogicalSize::new(
                    WIDTH_DRAWER,
                    HEIGHT_PASSPORT,
                ))));
                let _ = window.set_size(Size::Logical(LogicalSize::new(
                    WIDTH_NORMAL,
                    HEIGHT_NORMAL,
                )));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_steam_path,
            commands::get_saved_accounts,
            commands::check_token,
            commands::launch_steam,
            commands::check_account_live_async,
            commands::get_account_library_async,
            commands::save_account,
            commands::refresh_all_warranties_async,
            commands::refresh_all_profiles_async,
            commands::delete_saved_account,
            commands::clear_all_saved_accounts,
            commands::import_tokens_from_file_async,
            commands::reset_steam,
            commands::clear_all_steam_sessions,
            commands::kill_steam,
            commands::open_steam_dir,
            commands::open_browser,
            commands::change_path,
            commands::set_window_size,
            commands::set_window_size_animated,
            commands::minimize,
            commands::minimize_animated,
            commands::close_app,
            commands::start_drag,
            commands::on_drag_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SharpBuy Launcher");
}
