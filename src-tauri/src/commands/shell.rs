use std::process::Command;

#[tauri::command]
pub async fn run_shell(command: String) -> Result<String, String> {
    // Special handling for ls/dir commands to add file type indicators
    if command.trim() == "ls"
        || command.trim().starts_with("ls ")
        || command.trim() == "dir"
        || command.trim().starts_with("dir ")
    {
        let enhanced_command = if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            if command.trim() == "ls" {
                "ls -la".to_string()
            } else if command.trim().starts_with("ls ") {
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
                return Ok(crate::utils::format_directory_listing(&stdout));
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
                Ok(String::from(
                    "Command executed successfully with no output.",
                ))
            }
        }
        Err(e) => Err(format!("Failed to run command: {}", e)),
    }
}

#[tauri::command]
pub async fn run_sudo_command(command: String, password: String) -> Result<String, String> {
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
pub fn get_current_dir() -> Result<String, String> {
    std::env::current_dir()
        .map(|path| path.to_string_lossy().into_owned())
        .map_err(|e| format!("Failed to get current directory: {}", e))
}
