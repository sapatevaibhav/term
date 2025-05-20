#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::fs;

#[tauri::command]
fn run_shell(command: String) -> Result<String, String> {
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/C", &command]).output()
    } else {
        Command::new("sh").arg("-c").arg(&command).output()
    };

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let stderr = String::from_utf8_lossy(&out.stderr);
            Ok(format!("{}\n{}", stdout, stderr))
        }
        Err(e) => Err(format!("Failed to run command: {}", e)),
    }
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn ask_llm(prompt: String) -> Result<String, String> {
    let key = std::env::var("OPENAI_API_KEY").map_err(|_| "Missing API key".to_string())?;
    let client = reqwest::Client::new();

    // Get OS information
    let os_name = if cfg!(target_os = "windows") {
        "Windows"
    } else if cfg!(target_os = "macos") {
        "macOS"
    } else if cfg!(target_os = "linux") {
        "Linux"
    } else {
        "Unknown OS"
    };

    // Create system prompt
    let system_prompt = format!(
        "You are AI running in terminal called Term, a lightweight terminal assistant. You are running on {os_name}. \
        Your job is to help users with their terminal commands and queries. \
        If you detect a misspelled command, suggest the correct one. \
        If the user asks for help, command explanation, or summarization, provide \
        concise, accurate information. \
        For technical questions, give short, practical answers focused on terminal usage. \
        If asked to run a destructive command, warn the user about potential consequences. \
        Keep responses brief, informative, and focused on helping the user accomplish their task."
    );

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(key)
        .json(&serde_json::json!({
            "model": "gpt-4o-mini",
            "messages": [
                { "role": "system", "content": system_prompt },
                { "role": "user", "content": prompt }
            ]
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    Ok(json["choices"][0]["message"]["content"].as_str().unwrap_or("No response").to_string())
}

fn main() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_shell, read_file, ask_llm])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
