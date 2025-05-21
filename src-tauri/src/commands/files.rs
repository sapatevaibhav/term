use std::fs;

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let expanded_path =
        if path.starts_with("~") && path.len() > 1 && path.chars().nth(1) == Some('/') {
            if let Some(home) = dirs::home_dir() {
                home.join(&path[2..]).to_string_lossy().into_owned()
            } else {
                path
            }
        } else {
            path
        };

    fs::read_to_string(expanded_path).map_err(|e| format!("Failed to read file: {}", e))
}
