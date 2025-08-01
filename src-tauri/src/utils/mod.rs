pub fn format_directory_listing(output: &str) -> String {
    let lines: Vec<&str> = output.lines().collect();
    let mut formatted_output = String::new();

    for line in lines {
        if line.trim().is_empty() {
            formatted_output.push_str(line);
            formatted_output.push('\n');
            continue;
        }

        if line.starts_with("total ") || line.contains("Directory of") {
            formatted_output.push_str(line);
            formatted_output.push('\n');
            continue;
        }

        // Special handling for Unix-style ls output
        if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            let first_char = line.chars().next().unwrap_or(' ');

            if first_char == 'd' {
                formatted_output.push_str(&format!("{{DIR}}{}{{/DIR}}", line));
                formatted_output.push('\n');
                continue;
            } else if first_char == 'l' {
                formatted_output.push_str(&format!("{{LINK}}{}{{/LINK}}", line));
                formatted_output.push('\n');
                continue;
            } else if first_char == '-' || first_char.is_alphanumeric() {
                formatted_output.push_str(&format!("{{FILE}}{}{{/FILE}}", line));
                formatted_output.push('\n');
                continue;
            }
        }

        // Windows DIR command handling or fallback
        let tokens: Vec<&str> = line.split_whitespace().collect();
        if !tokens.is_empty() {
            let name = tokens.last().unwrap_or(&"");

            if line.contains("<DIR>") || name.ends_with("/") || name.ends_with("\\") {
                formatted_output.push_str(&format!("{{DIR}}{}{{/DIR}}", line));
            } else {
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
