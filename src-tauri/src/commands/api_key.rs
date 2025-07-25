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
    // Basic format validation
    if !key.starts_with("sk-") {
        return Err("API key must start with 'sk-'".to_string());
    }

    if key.len() < 20 {
        return Err("API key appears to be too short".to_string());
    }

    let client = reqwest::Client::new();
    
    // Try a simpler models endpoint to validate the key
    let res = client
        .get("https://api.openai.com/v1/models")
        .header("Authorization", format!("Bearer {}", key))
        .header("User-Agent", "Terminal-App/1.0")
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if res.status().is_success() {
        Ok(true)
    } else {
        let status = res.status();
        let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        
        match status.as_u16() {
            401 => Err("Invalid API key - authentication failed".to_string()),
            403 => Err("API key lacks required permissions".to_string()),
            429 => Err("Rate limit exceeded - please try again later".to_string()),
            500..=599 => Err(format!("OpenAI server error ({}): {}", status, error_text)),
            _ => Err(format!("API validation failed ({}): {}", status, error_text))
        }
    }
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
