// src-tauri/src/commands/ai.rs
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationMessage {
    pub role: String, // "user", "assistant", or "system"
    pub content: String,
    pub timestamp: u64,
}

#[derive(Debug, Default)]
pub struct ConversationHistory {
    messages: Arc<Mutex<Vec<ConversationMessage>>>,
    max_messages: usize,
}

impl ConversationHistory {
    pub fn new(max_messages: usize) -> Self {
        Self {
            messages: Arc::new(Mutex::new(Vec::new())),
            max_messages,
        }
    }

    pub fn add_message(&self, role: String, content: String) {
        let mut messages = self.messages.lock().unwrap();
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        messages.push(ConversationMessage {
            role,
            content,
            timestamp,
        });

        // Keep only the last N messages to avoid token limit issues
        if messages.len() > self.max_messages {
            messages.drain(0..messages.len() - self.max_messages);
        }
    }

    pub fn get_messages(&self) -> Vec<ConversationMessage> {
        self.messages.lock().unwrap().clone()
    }

    pub fn clear(&self) {
        self.messages.lock().unwrap().clear();
    }

    pub fn get_context_summary(&self) -> String {
        let messages = self.messages.lock().unwrap();
        if messages.is_empty() {
            return String::new();
        }

        let mut context = String::new();
        context.push_str("Previous conversation context:\n");
        
        // Include last few exchanges for context
        let recent_messages: Vec<&ConversationMessage> = messages
            .iter()
            .rev()
            .take(6) // Last 3 user-assistant pairs
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect();

        for msg in recent_messages {
            match msg.role.as_str() {
                "user" => context.push_str(&format!("User: {}\n", msg.content)),
                "assistant" => context.push_str(&format!("Assistant: {}\n", msg.content)),
                _ => {}
            }
        }
        
        context.push_str("---\n");
        context
    }
}

#[tauri::command]
pub async fn ask_llm_with_history(
    prompt: String, 
    app_handle: AppHandle,
    conversation_state: State<'_, ConversationHistory>
) -> Result<String, String> {
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

    // Get conversation history context
    let context_summary = conversation_state.get_context_summary();
    
    let system_prompt = format!(
        "You are AI running in terminal called Term, a lightweight terminal assistant. You are running on {os_name}. \
        Your job is to help users with their terminal commands and queries. \
        If you detect a misspelled command, suggest the correct one. \
        If the user asks for help, command explanation, or summarization, provide \
        concise, accurate information. \
        For technical questions, give short, practical answers focused on terminal usage. \
        If asked to run a destructive command, warn the user about potential consequences. \
        If asked for irrelevant information, politely tell that you can't help with that. \
        Keep responses brief, informative, and focused on helping the user accomplish their task.\
        \n\n{}",
        if context_summary.is_empty() { 
            String::new() 
        } else { 
            format!("IMPORTANT: Use this conversation history to provide contextually aware responses:\n{}", context_summary)
        }
    );

    // Build messages array with conversation history
    let mut messages = vec![
        serde_json::json!({
            "role": "system",
            "content": system_prompt
        })
    ];

    // Add recent conversation history
    let history = conversation_state.get_messages();
    for msg in history.iter().rev().take(10).collect::<Vec<_>>().into_iter().rev() {
        if msg.role == "user" || msg.role == "assistant" {
            messages.push(serde_json::json!({
                "role": msg.role,
                "content": msg.content
            }));
        }
    }

    // Add current user message
    messages.push(serde_json::json!({
        "role": "user",
        "content": prompt
    }));

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(key)
        .json(&serde_json::json!({
            "model": "gpt-4o-mini",
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0.7
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    
    let assistant_response = json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    // Add both user prompt and assistant response to conversation history
    conversation_state.add_message("user".to_string(), prompt);
    conversation_state.add_message("assistant".to_string(), assistant_response.clone());

    Ok(assistant_response)
}

#[tauri::command]
pub async fn clear_conversation_history(
    conversation_state: State<'_, ConversationHistory>
) -> Result<(), String> {
    conversation_state.clear();
    Ok(())
}

#[tauri::command]
pub async fn get_conversation_summary(
    conversation_state: State<'_, ConversationHistory>
) -> Result<String, String> {
    let messages = conversation_state.get_messages();
    if messages.is_empty() {
        return Ok("No conversation history available.".to_string());
    }

    let mut summary = String::new();
    summary.push_str(&format!("Conversation History ({} messages):\n\n", messages.len()));

    for (i, msg) in messages.iter().enumerate() {
        let timestamp = chrono::DateTime::from_timestamp(msg.timestamp as i64, 0)
            .map(|dt| dt.format("%H:%M:%S").to_string())
            .unwrap_or_else(|| "Unknown".to_string());

        match msg.role.as_str() {
            "user" => summary.push_str(&format!("[{}] User: {}\n", timestamp, msg.content)),
            "assistant" => summary.push_str(&format!("[{}] AI: {}\n\n", timestamp, msg.content)),
            _ => {}
        }
    }

    Ok(summary)
}

// Keep the original function for backwards compatibility
#[tauri::command]
pub async fn ask_llm(prompt: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    // This is a simplified version without history - you might want to phase this out
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