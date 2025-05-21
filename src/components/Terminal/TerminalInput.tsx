import React, { useRef, useEffect, useState } from 'react';
import useCommandHistory from '../../hooks/useCommandHistory';
import { getAutocompleteSuggestions } from '../../utils/autocomplete';

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
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
    const [showCompletionHelp, setShowCompletionHelp] = useState(false);
    const [baseInput, setBaseInput] = useState('');
    const [tabPressCount, setTabPressCount] = useState(0);

    const {
        navigateHistory,
        addToHistory
    } = useCommandHistory();

    // Focus input when processing state changes
    useEffect(() => {
        if (!isProcessing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isProcessing]);

    // Reset suggestions when input changes (but not if we're cycling through suggestions)
    useEffect(() => {
        const isCycling = tabPressCount > 0 && suggestions.length > 0;

        if (!isCycling && input !== baseInput) {
            setSuggestions([]);
            setCurrentSuggestionIndex(0);
            setShowCompletionHelp(false);
            setTabPressCount(0);
        }
    }, [input, baseInput, suggestions, tabPressCount]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const newInput = navigateHistory(e.key === 'ArrowUp' ? 'up' : 'down');
            if (newInput !== undefined) {
                setInput(newInput);
                setSuggestions([]);
                setCurrentSuggestionIndex(0);
                setShowCompletionHelp(false);
                setTabPressCount(0);
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();

            // First Tab press - get suggestions
            if (tabPressCount === 0) {
                setBaseInput(input);

                try {
                    const result = await getAutocompleteSuggestions(input);

                    // If we have direct replacement
                    if (result.replacement) {
                        setInput(result.replacement);
                        setSuggestions(result.suggestions);
                        setTabPressCount(1);

                        // Only show help if there are multiple suggestions
                        setShowCompletionHelp(result.suggestions.length > 1);
                        return;
                    }

                    // If we have common prefix
                    if (result.commonPrefix) {
                        setInput(result.commonPrefix);
                        setSuggestions(result.suggestions);
                        setTabPressCount(1);
                        setShowCompletionHelp(result.suggestions.length > 1);
                        return;
                    }

                    // If we have multiple suggestions
                    if (result.suggestions.length > 0) {
                        setSuggestions(result.suggestions);
                        setShowCompletionHelp(true);
                        setTabPressCount(1);

                        // Select the first suggestion
                        const words = input.split(' ');
                        const lastWord = words[words.length - 1];
                        const beforeLastWord = input.substring(0, input.length - lastWord.length);

                        setInput(beforeLastWord + result.suggestions[0]);
                        setCurrentSuggestionIndex(0);
                    }
                } catch (error) {
                    console.error("Error during autocomplete:", error);
                }
            }
            // Subsequent Tab presses - cycle through suggestions
            else if (suggestions.length > 0) {
                // Calculate next suggestion index
                const nextIndex = (currentSuggestionIndex + 1) % suggestions.length;
                setCurrentSuggestionIndex(nextIndex);

                // Update input with next suggestion
                const words = baseInput.split(' ');
                const lastWord = words[words.length - 1];
                const beforeLastWord = baseInput.substring(0, baseInput.length - lastWord.length);

                setInput(beforeLastWord + suggestions[nextIndex]);
                setTabPressCount(tabPressCount + 1);
            }
        } else if (e.key === 'Escape') {
            // Hide suggestions on escape
            setSuggestions([]);
            setCurrentSuggestionIndex(0);
            setShowCompletionHelp(false);
            setTabPressCount(0);
        } else {
            // Any other key - reset tab behavior
            setTabPressCount(0);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        // Reset suggestions when input changes manually
        setSuggestions([]);
        setShowCompletionHelp(false);
        setTabPressCount(0);
    };

    const handleSuggestionClick = (suggestion: string) => {
        // Handle suggestion selection
        const words = baseInput.split(' ');
        const lastWord = words[words.length - 1];
        const beforeLastWord = baseInput.substring(0, baseInput.length - lastWord.length);

        setInput(beforeLastWord + suggestion);
        setSuggestions([]);
        setShowCompletionHelp(false);
        setTabPressCount(0);

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSubmitWrapper = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (input.trim()) {
            addToHistory(input.trim());
        }

        setSuggestions([]);
        setCurrentSuggestionIndex(0);
        setShowCompletionHelp(false);
        setTabPressCount(0);

        onSubmit(e);
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmitWrapper} className="flex items-center p-3 bg-gray-800 border-t border-gray-700">
                <span className="text-blue-400 mr-1.5 font-bold">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter command or ask something..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                    autoFocus
                    className="flex-1 bg-transparent border-none text-white text-sm font-mono outline-none py-2"
                />
            </form>

            {/* Tab completion help */}
            {showCompletionHelp && suggestions.length > 1 && (
                <div className="absolute bottom-full left-0 w-full bg-gray-800 border border-gray-700 rounded shadow-lg p-2 text-sm z-10 max-h-60 overflow-y-auto">
                    <div className="text-xs text-gray-400 mb-1">
                        Press <span className="bg-gray-700 px-1 rounded">Tab</span> to cycle through {suggestions.length} options:
                    </div>
                    <div className="flex flex-wrap gap-2 text-gray-300">
                        {suggestions.map((suggestion, idx) => {
                            let uiDisplayName = suggestion;
                            const lastSlashIdx = suggestion.lastIndexOf('/');

                            if (lastSlashIdx !== -1) {
                                if (lastSlashIdx === suggestion.length - 1 && suggestion.length > 1) {
                                    const namePartWithoutTrailingSlash = suggestion.substring(0, lastSlashIdx);
                                    const secondLastSlashIdx = namePartWithoutTrailingSlash.lastIndexOf('/');
                                    if (secondLastSlashIdx !== -1) {
                                        uiDisplayName = namePartWithoutTrailingSlash.substring(secondLastSlashIdx + 1) + '/';
                                    } else {
                                        uiDisplayName = namePartWithoutTrailingSlash + '/';
                                    }
                                } else if (lastSlashIdx < suggestion.length - 1) {
                                    uiDisplayName = suggestion.substring(lastSlashIdx + 1);
                                }
                            }

                            const isDirectory = uiDisplayName.endsWith('/');
                            const isExecutable = uiDisplayName.endsWith('*');

                            let colorClass = 'bg-gray-700';

                            if (isDirectory) {
                                colorClass = 'bg-blue-900';
                            } else if (isExecutable) {
                                colorClass = 'bg-green-900';
                            } else {
                                // Keep default color for regular files
                            }

                            return (
                                <span
                                    key={idx}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`px-2 py-0.5 rounded font-mono cursor-pointer ${idx === currentSuggestionIndex ? 'bg-blue-600 text-white' : colorClass
                                        } hover:bg-opacity-80`}
                                >
                                    {uiDisplayName}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TerminalInput;
