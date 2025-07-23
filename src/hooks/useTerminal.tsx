import { useState, useCallback } from 'react';
import type { HistoryItem } from '../components/Terminal/types';

const useTerminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const appendHistory = useCallback((entry: HistoryItem) => {
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
