import { useState, useRef, useEffect } from 'react';
import { parseInput } from './utils/intentParser';
import type { Intent } from './utils/intentParser';
import { invoke } from '@tauri-apps/api/core'; // Tauri v2 style
import './App.css';

type HistoryEntry = {
  type: 'command' | 'output' | 'error' | 'llm';
  content: string;
};

function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const appendHistory = (entry: HistoryEntry) => {
    setHistory((prev) => [...prev, entry]);
  };

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when app loads and when processing completes
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user command to history
    appendHistory({ type: 'command', content: input });

    // Start processing
    setIsProcessing(true);

    const parsed: Intent = parseInput(input);

    try {
      if (parsed.type === "system_command") {
        const result = await invoke<string>("run_shell", { command: parsed.command });
        const commandNotFoundRegex = /\bcommand not found\b/i;
        const notRecognizedRegex = /\bnot recognized\b/i;

        if (commandNotFoundRegex.test(result) || notRecognizedRegex.test(result)) {
          // Don't show error messages about fallback, just indicate it's an error
          appendHistory({ type: 'error', content: result.trim() });

          // Use LLM silently
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
        // Fallback for unrecognized intents - silently use LLM
        const fallback = await invoke<string>("ask_llm", { prompt: input });
        appendHistory({ type: 'llm', content: fallback.trim() });
      }
    } catch (err: any) {
      appendHistory({ type: 'error', content: `${err.message || err}` });
    } finally {
      setIsProcessing(false);
    }

    setInput("");
  };

  return (
    <div className="terminal-container">
      <div className="terminal-output" ref={terminalOutputRef}>
        {history.length === 0 && (
          <div className="welcome-message">
            <div className="term-logo">Term</div>
            <div className="term-subtitle">AI-powered Terminal Assistant</div>
            <div className="term-help">Type a command or ask a question to get started.</div>
          </div>
        )}
        {history.map((entry, idx) => (
          <div key={idx} className={`terminal-line ${entry.type}`}>
            {entry.type === 'command' && <span className="prompt">$</span>}
            {entry.type === 'llm' && <span className="ai-indicator">AI</span>}
            {entry.content}
          </div>
        ))}
        {isProcessing && (
          <div className="terminal-line processing">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="terminal-input">
        <span className="prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter command or ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          autoFocus
          className="w-full"
        />
      </form>
    </div>
  );
}

export default App;
