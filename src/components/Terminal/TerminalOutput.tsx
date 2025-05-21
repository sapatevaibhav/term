import React, { useRef, useEffect } from 'react';
import type { HistoryEntry } from './types';
import WelcomeMessage from './WelcomeMessage';
import OutputFormatter from './OutputFormatter';
import Spinner from '../UI/Spinner';

interface TerminalOutputProps {
    history: HistoryEntry[];
    isProcessing: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ history, isProcessing }) => {
    const terminalOutputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalOutputRef.current) {
            terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div
            ref={terminalOutputRef}
            className="flex-1 overflow-y-auto p-4 font-mono"
        >
            {history.length === 0 && <WelcomeMessage />}

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
                        entry.type === 'output' && typeof entry.content === 'string' &&
                            (entry.content.includes("{DIR}") || entry.content.includes("{FILE}"))
                            ? <OutputFormatter content={entry.content} />
                            : entry.content
                    )}
                </div>
            ))}

            {isProcessing && <Spinner />}
        </div>
    );
};

export default TerminalOutput;
