#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            term::run_shell,
            term::run_sudo_command,
            term::read_file,
            term::ask_llm,
            term::get_current_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
