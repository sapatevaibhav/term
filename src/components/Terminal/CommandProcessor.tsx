import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { parseInput } from '../../utils/intentParser';
import type { CommandProcessorProps } from './types';

const useCommandProcessor = ({
    input,
    setInput,
    appendHistory,
    setIsProcessing,
    clearTerminal
}: CommandProcessorProps) => {
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [pendingSudoCommand, setPendingSudoCommand] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        appendHistory({ type: 'command', content: input });
        setIsProcessing(true);

        if (input.trim().toLowerCase() === 'clear') {
            clearTerminal();
            setInput("");
            setIsProcessing(false);
            return;
        }

        // Handle exit command
        if (input.trim().toLowerCase() === 'exit') {
            setInput("");
            setTimeout(async () => {
                try {
                    await getCurrentWindow().close();
                } catch (err) {
                    setIsProcessing(false);
                }
            }, 5);
            return;
        }

        const parsed = parseInput(input);

        try {
            if (parsed.type === "system_command") {
                if (parsed.command.trim().startsWith("sudo ")) {
                    setPendingSudoCommand(parsed.command);
                    setShowPasswordDialog(true);
                    setInput("");
                    return;
                }

                const result = await invoke<string>("run_shell", { command: parsed.command });
                const commandNotFoundRegex = /\bcommand not found\b/i;
                const notRecognizedRegex = /\bnot recognized\b/i;

                if (commandNotFoundRegex.test(result) || notRecognizedRegex.test(result)) {
                    appendHistory({ type: 'error', content: result.trim() });
                    const fallback = await invoke<string>("ask_llm", { prompt: input });
                    appendHistory({ type: 'llm', content: fallback.trim() });
                } else {
                    appendHistory({ type: 'output', content: result.trim() });
                }
            } else if (parsed.type === "file_view") {
                const result = await invoke<string>("read_file", { path: parsed.filename });
                appendHistory({ type: 'output', content: result.trim() });
            } else if (parsed.type === "file_summary") {
                const fileContent = await invoke<string>("read_file", { path: parsed.filename });
                const summary = await invoke<string>("ask_llm", {
                    prompt: `Summarize the following file:\n\n${fileContent}`,
                });
                appendHistory({ type: 'llm', content: summary.trim() });
            } else if (parsed.type === "llm_query") {
                const result = await invoke<string>("ask_llm", { prompt: parsed.prompt });
                appendHistory({ type: 'llm', content: result.trim() });
            } else {
                const fallback = await invoke<string>("ask_llm", { prompt: input });
                appendHistory({ type: 'llm', content: fallback.trim() });
            }

            appendHistory({ type: 'separator', content: '' });
        } catch (err: any) {
            appendHistory({ type: 'error', content: `${err.message || err}` });
            appendHistory({ type: 'separator', content: '' });
        } finally {
            setIsProcessing(false);
        }

        setInput("");
    };

    const handleSudoWithPassword = async (password: string) => {
        setShowPasswordDialog(false);

        appendHistory({ type: 'output', content: "⚡ Executing sudo command... This may take a moment." });

        try {
            const result = await invoke<string>("run_sudo_command", {
                command: pendingSudoCommand,
                password: password
            });
            appendHistory({ type: 'output', content: result.trim() });
        } catch (err: any) {
            let errorMessage = `${err.message || err}`;

            console.error("Sudo error:", errorMessage);

            if (errorMessage.includes("Incorrect password")) {
                appendHistory({
                    type: 'error',
                    content: "🔒 Authentication failed: Incorrect password provided."
                });
            } else {
                appendHistory({
                    type: 'error',
                    content: `Error executing sudo command: ${errorMessage}`
                });
            }
        } finally {
            appendHistory({ type: 'separator', content: '' });
            setIsProcessing(false);
            setPendingSudoCommand('');
        }
    };

    return {
        handleSubmit,
        handleSudoWithPassword,
        showPasswordDialog,
        setShowPasswordDialog,
        pendingSudoCommand,
        setPendingSudoCommand
    };
};

export default useCommandProcessor;
