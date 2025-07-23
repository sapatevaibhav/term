#[tauri::command]
pub async fn ask_llm(prompt: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    // First try to get API key from storage
    let key = match crate::commands::api_key::get_api_key(app_handle).await {
        Ok(stored_key) if !stored_key.is_empty() => stored_key,
        _ => return Err("API key not configured. Please set your OpenAI API key with the 'setapikey YOUR_API_KEY' command.".to_string())
    };

    let client = reqwest::Client::new();

    let os_name = if cfg!(target_os = "windows") {
        "Windows"
    } else if cfg!(target_os = "macos") {
        "macOS"
    } else if cfg!(target_os = "linux") {
        "Linux"
    } else {
        "Unknown OS"
    };

    let system_prompt = format!(
        "You are AI running in terminal called Term, a lightweight terminal assistant. You are running on {os_name}. \
        Your job is to help users with their terminal commands and queries. \
        If you detect a misspelled command, suggest the correct one. \
        If the user asks for help, command explanation, or summarization, provide \
        concise, accurate information. \
        For technical questions, give short, practical answers focused on terminal usage. \
        If asked to run a destructive command, warn the user about potential consequences. \
        If asked for irrelevant information, politely tell that you can't help with that. \
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
    Ok(json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string())
}
