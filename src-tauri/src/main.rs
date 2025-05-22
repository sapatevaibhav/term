#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod utils;

fn main() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::shell::run_shell,
            commands::shell::run_sudo_command,
            commands::shell::get_current_dir,
            commands::shell::list_directory_contents,
            commands::shell::change_directory,
            commands::ai::ask_llm
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
