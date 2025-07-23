import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ApiKeyPromptProps {
    onKeySet: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySet }) => {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            const isValid = await invoke<boolean>('validate_api_key', { key: apiKey });

            if (isValid) {
                await invoke('save_api_key', { key: apiKey });
                onKeySet();
            } else {
                setError('Invalid API key. Please check and try again.');
            }
        } catch (err) {
            setError(`Error: ${err}`);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="text-white mt-2">
            <p>Please enter your OpenAI API key to continue:</p>
            <form onSubmit={handleSubmit} className="mt-2">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="bg-black border border-gray-700 px-2 py-1 w-full max-w-md"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isValidating}
                    className="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
                >
                    {isValidating ? 'Validating...' : 'Set Key'}
                </button>
            </form>
            {error && <p className="text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default ApiKeyPrompt;
