import React from 'react';
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
