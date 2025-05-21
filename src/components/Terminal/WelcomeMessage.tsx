import React from 'react';

const WelcomeMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-5xl font-bold mb-3 text-blue-400">Term</div>
            <div className="text-lg mb-6 text-green-400">AI-powered Terminal Assistant</div>
            <div className="text-sm text-gray-400">Type a command or ask a question to get started.</div>
            <div className="text-xs text-gray-500 mt-2">Use Up/Down arrows to navigate command history.</div>
        </div>
    );
};

export default WelcomeMessage;
