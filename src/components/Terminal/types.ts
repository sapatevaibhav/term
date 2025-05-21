export type HistoryEntry = {
    type: 'command' | 'output' | 'error' | 'llm' | 'separator';
    content: string;
};

export type CommandProcessorProps = {
    input: string;
    setInput: (input: string) => void;
    appendHistory: (entry: HistoryEntry) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    clearTerminal: () => void;
};
