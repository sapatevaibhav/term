import React, { useRef, useEffect } from 'react';
import useCommandHistory from '../../hooks/useCommandHistory';

interface TerminalInputProps {
    input: string;
    setInput: (input: string) => void;
    isProcessing: boolean;
    onSubmit: (e: React.FormEvent) => Promise<void>;
}

const TerminalInput: React.FC<TerminalInputProps> = ({
    input,
    setInput,
    isProcessing,
    onSubmit
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const {

        navigateHistory,
        addToHistory
    } = useCommandHistory();

    useEffect(() => {
        if (!isProcessing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isProcessing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const newInput = navigateHistory(e.key === 'ArrowUp' ? 'up' : 'down');
            if (newInput !== undefined) {
                setInput(newInput);
            }
        }
    };

    const handleSubmitWrapper = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (input.trim()) {
            addToHistory(input.trim());
        }

        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmitWrapper} className="flex items-center p-3 bg-gray-800 border-t border-gray-700">
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
    );
};

export default TerminalInput;
