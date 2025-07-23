use dirs;
use reqwest;
use std::{fs, path::PathBuf};
use tauri::AppHandle;

// Function to get the path where the API key is stored
fn get_key_path(_app_handle: &AppHandle) -> PathBuf {
    let dir = dirs::config_dir()
        .expect("Failed to get config directory")
        .join("term");

    if !dir.exists() {
        fs::create_dir_all(&dir).expect("Failed to create term directory");
    }

    dir.join("apikey")
}

#[tauri::command]
pub async fn save_api_key(app_handle: AppHandle, key: String) -> Result<(), String> {
    let path = get_key_path(&app_handle);
    fs::write(path, key).map_err(|e| e.to_string())
}

// Get API key from file
#[tauri::command]
pub async fn get_api_key(app_handle: AppHandle) -> Result<String, String> {
    let path = get_key_path(&app_handle);

    if !path.exists() {
        return Ok(String::new());
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}

// Validate API key with OpenAI
#[tauri::command]
pub async fn validate_api_key(key: String) -> Result<bool, String> {
    let client = reqwest::Client::new();
    let res = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", key))
        .json(&serde_json::json!({
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": "Hi"}],
            "max_tokens": 1
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(res.status().is_success())
}

// Delete the API key file
#[tauri::command]
pub async fn delete_api_key(app_handle: AppHandle) -> Result<(), String> {
    let path = get_key_path(&app_handle);

    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }

    Ok(())
}
