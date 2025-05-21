#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process::Command;

#[tauri::command]
async fn run_shell(command: String) -> Result<String, String> {
    // Special handling for ls/dir commands to add file type indicators
    if command.trim() == "ls" || command.trim().starts_with("ls ") ||
       command.trim() == "dir" || command.trim().starts_with("dir ") {
        // For Linux/macOS systems, use ls -la for more detailed output
        let enhanced_command = if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            // Replace ls with ls -la to include file types
            if command.trim() == "ls" {
                "ls -la".to_string()
            } else if command.trim().starts_with("ls ") {
                // Preserve arguments but add -la if not already present
                if !command.contains(" -l") && !command.contains(" -a") {
                    format!("{} -la", command)
                } else if !command.contains(" -l") {
                    format!("{} -l", command)
                } else if !command.contains(" -a") {
                    format!("{} -a", command)
                } else {
                    command.clone()
                }
            } else {
                command.clone()
            }
        } else {
            command.clone()
        };

        // Execute the command
        let output = if cfg!(target_os = "windows") {
            Command::new("cmd").args(["/C", &enhanced_command]).output()
        } else {
            Command::new("sh").arg("-c").arg(&enhanced_command).output()
        };

        match output {
            Ok(out) => {
                let stdout = String::from_utf8_lossy(&out.stdout);
                let stderr = String::from_utf8_lossy(&out.stderr);

                if !stderr.is_empty() && stdout.is_empty() {
                    return Ok(stderr.to_string());
                }

                // Process the output to add file type indicators
                return Ok(format_directory_listing(&stdout));
            }
            Err(e) => return Err(format!("Failed to run command: {}", e)),
        }
    }

    // Regular command execution (non-ls commands)
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/C", &command]).output()
    } else {
        Command::new("sh").arg("-c").arg(&command).output()
    };

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let stderr = String::from_utf8_lossy(&out.stderr);

            if !stderr.is_empty() && stdout.is_empty() {
                Ok(stderr.to_string())
            } else if !stdout.is_empty() {
                Ok(stdout.to_string())
            } else {
                Ok(String::from("Command executed successfully with no output."))
            }
        }
        Err(e) => Err(format!("Failed to run command: {}", e)),
    }
}

// Helper function to format directory listings with file type indicators
fn format_directory_listing(output: &str) -> String {
    // Process the output line by line
    let lines: Vec<&str> = output.lines().collect();
    let mut formatted_output = String::new();

    for line in lines {
        // Skip empty lines
        if line.trim().is_empty() {
            formatted_output.push_str(line);
            formatted_output.push('\n');
            continue;
        }

        // If this is a header line or total count line, leave it unchanged
        if line.starts_with("total ") || line.contains("Directory of") {
            formatted_output.push_str(line);
            formatted_output.push('\n');
            continue;
        }

        // Special handling for Unix-style ls output
        if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            let first_char = line.chars().next().unwrap_or(' ');

            // Check first character of line for Unix ls output
            if first_char == 'd' {
                // Directory
                formatted_output.push_str(&format!("{{DIR}}{}{{/DIR}}", line));
                formatted_output.push('\n');
                continue;
            } else if first_char == 'l' {
                // Symlink (special handling)
                formatted_output.push_str(&format!("{{LINK}}{}{{/LINK}}", line));
                formatted_output.push('\n');
                continue;
            } else if first_char == '-' || first_char.is_alphanumeric() {
                // Regular file
                formatted_output.push_str(&format!("{{FILE}}{}{{/FILE}}", line));
                formatted_output.push('\n');
                continue;
            }
        }

        // Windows DIR command handling or fallback
        let tokens: Vec<&str> = line.split_whitespace().collect();
        if !tokens.is_empty() {
            let name = tokens.last().unwrap_or(&"");

            // Check if it's a directory
            if line.contains("<DIR>") || name.ends_with("/") || name.ends_with("\\") {
                formatted_output.push_str(&format!("{{DIR}}{}{{/DIR}}", line));
            } else {
                // Default to file if we can't determine
                formatted_output.push_str(&format!("{{FILE}}{}{{/FILE}}", line));
            }
            formatted_output.push('\n');
        } else {
            formatted_output.push_str(line);
            formatted_output.push('\n');
        }
    }

    formatted_output
}

#[tauri::command]
async fn run_sudo_command(command: String, password: String) -> Result<String, String> {
    if !cfg!(target_os = "linux") && !cfg!(target_os = "macos") {
        return Err("Sudo is only supported on Linux and macOS".to_string());
    }

    let cmd = if command.starts_with("sudo ") {
        command[5..].to_string()
    } else {
        command
    };

    let temp_dir = std::env::temp_dir();
    let output_file = temp_dir.join(format!("term_sudo_{}", std::process::id()));
    let output_path = output_file.to_string_lossy();

    let script = format!(
        r#"#!/bin/bash
echo "{}" | sudo -S {} > "{}" 2>&1
exit_code=$?
if [ $exit_code -ne 0 ]; then
    echo "Command failed with exit code $exit_code" >> "{}"
fi
"#,
        password.replace("\"", "\\\""),
        cmd.replace("\"", "\\\""),
        output_path,
        output_path
    );

    let script_file = temp_dir.join(format!("term_sudo_script_{}", std::process::id()));
    std::fs::write(&script_file, script).map_err(|e| format!("Failed to create script: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&script_file)
            .map_err(|e| format!("Failed to get file metadata: {}", e))?
            .permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(&script_file, perms)
            .map_err(|e| format!("Failed to set permissions: {}", e))?;
    }

    let _status = tokio::process::Command::new(&script_file)
        .status()
        .await
        .map_err(|e| format!("Failed to execute script: {}", e))?;

    let _ = std::fs::remove_file(&script_file);

    let output = std::fs::read_to_string(&output_file)
        .map_err(|e| format!("Failed to read output: {}", e))?;

    let _ = std::fs::remove_file(&output_file);

    if output.contains("incorrect password")
        || output.contains("Sorry, try again")
        || output.contains("Authentication failure")
        || output.contains("authentication failure")
        || output.contains("sudo: no password was provided")
        || output.contains("sudo: 1 incorrect password attempt")
    {
        return Err("Incorrect password provided".to_string());
    }

    Ok(output)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
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

#[tauri::command]
async fn ask_llm(prompt: String) -> Result<String, String> {
    let key = std::env::var("OPENAI_API_KEY").map_err(|_| "Missing API key".to_string())?;
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

#[tauri::command]
fn get_current_dir() -> Result<String, String> {
    std::env::current_dir()
        .map(|path| path.to_string_lossy().into_owned())
        .map_err(|e| format!("Failed to get current directory: {}", e))
}

fn main() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            run_shell,
            run_sudo_command,
            read_file,
            ask_llm,
            get_current_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
