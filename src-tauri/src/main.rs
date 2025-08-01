#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod utils;
pub mod sudo;

use sudo::{SudoCache, fast_sudo, clear_sudo_cache, direct_privilege_escalation, check_sudo_privileges};
use tauri::Manager;

fn main() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .setup(|app| {
            app.manage(SudoCache::new());
            
            let cache = app.state::<SudoCache>();
            let cache_clone = cache.inner().clone();
            
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(300));
                    cache_clone.clear_expired(15);
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::shell::run_shell,
            commands::shell::get_current_dir,
            commands::shell::list_directory_contents,
            commands::shell::change_directory,
            commands::ai::ask_llm,
            commands::api_key::save_api_key,
            commands::api_key::get_api_key,
            commands::api_key::validate_api_key,
            commands::api_key::delete_api_key,
            fast_sudo,
            clear_sudo_cache,
            direct_privilege_escalation,
            check_sudo_privileges
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}