import { useState, useRef, useEffect } from 'react';
import { parseInput } from './utils/intentParser';
import type { Intent } from './utils/intentParser';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import PasswordDialog from './components/PasswordDialog';

type HistoryEntry = {
    type: 'command' | 'output' | 'error' | 'llm' | 'separator';
    content: string;
};

function App() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const terminalOutputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);


    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);


    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [pendingSudoCommand, setPendingSudoCommand] = useState('');

    const appendHistory = (entry: HistoryEntry) => {
        setHistory((prev) => [...prev, entry]);
    };

    useEffect(() => {
        if (terminalOutputRef.current) {
            terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
        }
    }, [history]);

    useEffect(() => {
        if (!isProcessing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isProcessing]);


    const clearTerminal = () => {
        setHistory([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
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

    // Format directory listings with colors and type indicators
    const formatOutput = (content: string) => {
        if (content.includes("{DIR}") || content.includes("{FILE}") || content.includes("{LINK}")) {
            const lines = content.split('\n');
            return lines.map((line, i) => {
                // Directory line
                if (line.includes("{DIR}")) {
                    const cleanLine = line.replace("{DIR}", "").replace("{/DIR}", "");

                    // Extract the file name for Unix-style listings
                    let displayName = cleanLine;

                    // For Unix-style ls output with permissions
                    if (cleanLine.match(/^d[-rwx]{9}/)) {
                        const parts = cleanLine.split(/\s+/);
                        if (parts.length >= 8) {
                            // Get the last part which should be the name
                            const namePart = parts.slice(8).join(" ");

                            // Add a trailing slash if it doesn't have one
                            if (!namePart.endsWith("/")) {
                                displayName = cleanLine.replace(namePart, `${namePart}/`);
                            }
                        }
                    }

                    return (
                        <div key={i} className="text-blue-400 font-bold">
                            <span className="mr-2">📁</span>
                            {displayName}
                        </div>
                    );
                }
                // Symlink line
                else if (line.includes("{LINK}")) {
                    const cleanLine = line.replace("{LINK}", "").replace("{/LINK}", "");
                    return (
                        <div key={i} className="text-cyan-300">
                            <span className="mr-2">🔗</span>
                            {cleanLine}
                        </div>
                    );
                }
                // File line
                else if (line.includes("{FILE}")) {
                    const cleanLine = line.replace("{FILE}", "").replace("{/FILE}", "");

                    // Check for common file types to add appropriate icons
                    const isExecutable = cleanLine.match(/-[-r][-w]x/); // Unix executable
                    const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(cleanLine);
                    const isDocument = /\.(pdf|doc|docx|txt|md|json|xml|html|css|js|ts|jsx|tsx)$/i.test(cleanLine);
                    const isArchive = /\.(zip|tar|gz|rar|7z)$/i.test(cleanLine);

                    let icon = '📄';
                    let colorClass = 'text-gray-300';

                    if (isExecutable) {
                        icon = '⚙️';
                        colorClass = 'text-green-300';
                    } else if (isImage) {
                        icon = '🖼️';
                        colorClass = 'text-purple-300';
                    } else if (isDocument) {
                        icon = '📝';
                        colorClass = 'text-yellow-200';
                    } else if (isArchive) {
                        icon = '📦';
                        colorClass = 'text-orange-300';
                    }

                    return (
                        <div key={i} className={colorClass}>
                            <span className="mr-2">{icon}</span>
                            {cleanLine}
                        </div>
                    );
                }
                // Regular line
                else {
                    return <div key={i}>{line}</div>;
                }
            });
        }
        return content; // Return the original content if no special formatting needed
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;


        if (input.trim()) {
            setCommandHistory(prev => [...prev, input.trim()]);
            setHistoryIndex(-1);
        }

        appendHistory({ type: 'command', content: input });
        setIsProcessing(true);


        if (input.trim().toLowerCase() === 'clear') {
            clearTerminal();
            setInput("");
            setIsProcessing(false);
            return;
        }

        const parsed: Intent = parseInput(input);

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

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
            <div
                ref={terminalOutputRef}
                className="flex-1 overflow-y-auto p-4 font-mono"
            >
                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-5xl font-bold mb-3 text-blue-400">Term</div>
                        <div className="text-lg mb-6 text-green-400">AI-powered Terminal Assistant</div>
                        <div className="text-sm text-gray-400">Type a command or ask a question to get started.</div>
                        <div className="text-xs text-gray-500 mt-2">Use Up/Down arrows to navigate command history.</div>
                    </div>
                )}
                {history.map((entry, idx) => (
                    <div key={idx} className={`mb-2 leading-normal whitespace-pre-wrap break-words ${entry.type === 'command' ? 'text-cyan-400 font-bold' :
                            entry.type === 'output' ? 'text-gray-300' :
                                entry.type === 'error' ? 'text-red-400' :
                                    entry.type === 'llm' ? 'border-l-2 border-green-500 pl-2 ml-0.5 bg-opacity-5 bg-green-900 text-green-400' :
                                        ''
                        }`}>
                        {entry.type === 'command' && <span className="text-blue-400 mr-1.5 font-bold">$</span>}
                        {entry.type === 'llm' && <span className="inline-block bg-green-600 text-black font-bold px-1.5 rounded mr-2">AI</span>}
                        {entry.type === 'separator' && <div className="border-b border-gray-700 my-2 opacity-30"></div>}
                        {entry.type !== 'separator' && (
                            entry.type === 'output' && typeof entry.content === 'string' && (entry.content.includes("{DIR}") || entry.content.includes("{FILE}"))
                                ? formatOutput(entry.content)
                                : entry.content
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="mb-2">
                        <div className="inline-block w-4 h-4 border-2 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center p-3 bg-gray-800 border-t border-gray-700">
                <span className="text-blue-400 mr-1.5 font-bold">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter command or ask something..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                    autoFocus
                    className="flex-1 bg-transparent border-none text-white text-sm font-mono outline-none py-2"
                />
            </form>

            {/* Password Dialog */}
            <PasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => {
                    setShowPasswordDialog(false);
                    setIsProcessing(false);
                    setPendingSudoCommand('');
                }}
                onSubmit={handleSudoWithPassword}
                commandText={pendingSudoCommand}
            />
        </div>
    );
}

export default App;
