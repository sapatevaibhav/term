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

        // Handle conversation history commands
        if (input.trim().toLowerCase() === 'clearhistory' || input.trim().toLowerCase() === 'clear-history') {
            try {
                await invoke('clear_conversation_history');
                appendHistory({
                    type: 'output',
                    content: 'Conversation history cleared successfully.'
                });
            } catch (error) {
                appendHistory({
                    type: 'error',
                    content: `Failed to clear conversation history: ${error}`
                });
            }
            setInput('');
            setIsProcessing(false);
            return;
        }

        if (input.trim().toLowerCase() === 'showhistory' || input.trim().toLowerCase() === 'show-history') {
            try {
                const summary = await invoke<string>('get_conversation_summary');
                appendHistory({
                    type: 'output',
                    content: summary
                });
            } catch (error) {
                appendHistory({
                    type: 'error',
                    content: `Failed to get conversation history: ${error}`
                });
            }
            setInput('');
            setIsProcessing(false);
            return;
        }

        // Handle exit command
        if (input.trim().toLowerCase() === 'exit') {
            try {
                await getCurrentWindow().close();
            } catch (error) {
                appendHistory({
                    type: 'error',
                    content: `Failed to exit: ${error}`
                });
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        // Handle API key related commands
        if (input.trim() === 'apikey' || input.trim() === 'api-key') {
            try {
                const apiKey = await invoke<string>('get_api_key');
                if (apiKey) {
                    appendHistory({
                        content: 'API key is configured.',
                        type: 'output'
                    });
                } else {
                    appendHistory({
                        content: 'No API key configured. Use "setapikey <your-key>" to set it.',
                        type: 'error'
                    });
                }
            } catch (error) {
                appendHistory({
                    content: `Error checking API key: ${error}`,
                    type: 'error'
                });
            }
            setInput('');
            setIsProcessing(false);
            return;
        }

        if (input.trim().startsWith('setapikey ')) {
            const key = input.trim().substring('setapikey '.length).trim();
            if (!key) {
                appendHistory({
                    content: 'Please provide an API key. Usage: setapikey <your-openai-api-key>',
                    type: 'error'
                });
                setInput('');
                setIsProcessing(false);
                return;
            }

            appendHistory({ content: 'Validating API key...', type: 'output' });
            try {
                const isValid = await invoke<boolean>('validate_api_key', { key });
                if (isValid) {
                    await invoke('save_api_key', { key });
                    appendHistory({
                        content: 'API key validated and saved successfully!',
                        type: 'output'
                    });
                } else {
                    appendHistory({
                        content: 'Invalid API key. Please check and try again.',
                        type: 'error'
                    });
                }
            } catch (error) {
                appendHistory({
                    content: `API Error: ${error}`,
                    type: 'error'
                });
            }
            setInput('');
            setIsProcessing(false);
            return;
        }

        if (input.trim() === 'resetapikey') {
            try {
                await invoke('delete_api_key');
                appendHistory({
                    content: 'API key has been removed successfully.',
                    type: 'output'
                });
                appendHistory({
                    content: 'You can set a new API key with the command: setapikey YOUR_API_KEY',
                    type: 'output'
                });
            } catch (error) {
                appendHistory({
                    content: `Error removing API key: ${error}`,
                    type: 'error'
                });
            }
            setInput('');
            setIsProcessing(false);
            return;
        }

        const parsed = parseInput(input);

        try {
            if (parsed.type === "system_command") {
                // Handle cd command separately
                if (parsed.command.trim().startsWith("cd ")) {
                    const path = parsed.command.trim().substring(3);
                    try {
                        const newDirectory = await invoke<string>("change_directory", { path });
                        appendHistory({
                            type: 'output',
                            content: `Changed directory to: ${newDirectory}`
                        });
                    } catch (error: any) {
                        appendHistory({
                            type: 'error',
                            content: error.toString()
                        });
                    }
                }
                else if (parsed.command.trim().startsWith("sudo ")) {
                    setPendingSudoCommand(parsed.command);
                    setShowPasswordDialog(true);
                    setInput("");
                    return;
                }
                else {
                    const result = await invoke<string>("run_shell", { command: parsed.command });
                    const commandNotFoundRegex = /\bcommand not found\b/i;
                    const notRecognizedRegex = /\bnot recognized\b/i;

                    if (commandNotFoundRegex.test(result) || notRecognizedRegex.test(result)) {
                        appendHistory({ type: 'error', content: result.trim() });
                        // Use the new AI function with history context
                        const fallback = await invoke<string>("ask_llm_with_history", { prompt: input });
                        appendHistory({ type: 'llm', content: fallback.trim() });
                    } else {
                        appendHistory({ type: 'output', content: result.trim() });
                    }
                }
            } else if (parsed.type === "file_view") {
                const result = await invoke<string>("read_file", { path: parsed.filename });
                appendHistory({ type: 'output', content: result.trim() });
            } else if (parsed.type === "file_summary") {
                const fileContent = await invoke<string>("read_file", { path: parsed.filename });
                // Use the new AI function with history context
                const summary = await invoke<string>("ask_llm_with_history", {
                    prompt: `Summarize the following file:\n\n${fileContent}`,
                });
                appendHistory({ type: 'llm', content: summary.trim() });
            } else if (parsed.type === "llm_query") {
                try {
                    // Use the new AI function with history context
                    const result = await invoke<string>("ask_llm_with_history", { prompt: parsed.prompt });
                    appendHistory({ type: 'llm', content: result.trim() });
                } catch (error: any) {
                    // Handle API key not configured errors
                    if (error.toString().includes("API key not configured")) {
                        appendHistory({
                            type: 'error',
                            content: 'API key not configured. Please set your OpenAI API key to use AI features.'
                        });
                        appendHistory({
                            type: 'output',
                            content: 'Use the command: setapikey YOUR_API_KEY'
                        });
                    } else {
                        appendHistory({ type: 'error', content: `${error.message || error}` });
                    }
                }
            } else {
                try {
                    // Use the new AI function with history context
                    const fallback = await invoke<string>("ask_llm_with_history", { prompt: input });
                    appendHistory({ type: 'llm', content: fallback.trim() });
                } catch (error: any) {
                    // Handle API key not configured errors
                    if (error.toString().includes("API key not configured")) {
                        appendHistory({
                            type: 'error',
                            content: 'API key not configured. Please set your OpenAI API key to use AI features.'
                        });
                        appendHistory({
                            type: 'output',
                            content: 'Use the command: setapikey YOUR_API_KEY'
                        });
                    } else {
                        appendHistory({ type: 'error', content: `${error.message || error}` });
                    }
                }
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