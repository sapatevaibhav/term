export interface CommandProcessorProps {
  input: string;
  setInput: (input: string) => void;
  appendHistory: (item: HistoryItem) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  clearTerminal: () => void;
}

export interface HistoryItem {
  type: 'command' | 'output' | 'error' |'llm' | 'separator';
  content: string;
}
