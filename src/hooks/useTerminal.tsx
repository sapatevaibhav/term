import { useState, useCallback } from 'react';
import type { HistoryEntry } from '../components/Terminal/types';

const useTerminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const appendHistory = useCallback((entry: HistoryEntry) => {
        setHistory((prev) => [...prev, entry]);
    }, []);

    const clearTerminal = useCallback(() => {
        setHistory([]);
    }, []);

    return {
        input,
        setInput,
        history,
        isProcessing,
        setIsProcessing,
        appendHistory,
        clearTerminal
    };
};

export default useTerminal;
