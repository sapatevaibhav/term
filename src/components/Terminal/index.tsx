import React, { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TerminalOutput from './TerminalOutput';
import TerminalInput from './TerminalInput';
import PasswordDialog from '../PasswordDialog';
import useTerminal from '../../hooks/useTerminal';
import useCommandProcessor from './CommandProcessor';

const Terminal: React.FC = () => {
    const {
        input,
        setInput,
        history,
        isProcessing,
        setIsProcessing,
        appendHistory,
        clearTerminal
    } = useTerminal();

    const {
        handleSubmit,
        handleSudoWithPassword,
        showPasswordDialog,
        setShowPasswordDialog,
        pendingSudoCommand
    } = useCommandProcessor({
        input,
        setInput,
        appendHistory,
        setIsProcessing,
        clearTerminal
    });

    // Check if API key exists on startup
    useEffect(() => {
        let mounted = true;

        const checkApiKey = async () => {
            try {
                const apiKey = await invoke<string>('get_api_key');
                if (!apiKey && mounted) {
                    // Only show one message about API key
                    appendHistory({
                        type: 'output',
                        content: 'No API key found. Please set your OpenAI API key to use AI features.'
                    });
                    appendHistory({
                        type: 'output',
                        content: 'You can set your API key by typing: setapikey YOUR_API_KEY'
                    });
                }
            } catch (error) {
                console.error('Failed to check API key:', error);
            }
        };

        checkApiKey();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
            <TerminalOutput history={history} isProcessing={isProcessing} />

            <TerminalInput
                input={input}
                setInput={setInput}
                isProcessing={isProcessing}
                onSubmit={handleSubmit}
            />

            <PasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => {
                    setShowPasswordDialog(false);
                    setIsProcessing(false);
                }}
                onSubmit={handleSudoWithPassword}
                commandText={pendingSudoCommand}
            />
        </div>
    );
};

export default Terminal;
