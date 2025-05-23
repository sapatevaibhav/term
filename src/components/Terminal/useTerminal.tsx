import { useState } from 'react';
import type { HistoryItem } from './types';

const useTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const appendHistory = (item: HistoryItem) => {
    setHistory(prev => [...prev, item]);
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  return {
    input,
    setInput,
    history,
    setHistory,
    isProcessing,
    setIsProcessing,
    appendHistory,
    clearTerminal
  };
};

export default useTerminal;
