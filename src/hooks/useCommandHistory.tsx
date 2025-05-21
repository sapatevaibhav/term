import { useState } from 'react';

const useCommandHistory = () => {
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const addToHistory = (command: string) => {
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(-1);
    };

    const navigateHistory = (direction: 'up' | 'down'): string | undefined => {
        if (direction === 'up') {
            if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                return commandHistory[commandHistory.length - 1 - newIndex];
            }
        } else if (direction === 'down') {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                return commandHistory[commandHistory.length - 1 - newIndex];
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                return '';
            }
        }
        return undefined;
    };

    return {
        commandHistory,
        historyIndex,
        addToHistory,
        navigateHistory
    };
};

export default useCommandHistory;
