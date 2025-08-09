import React from 'react';

const WelcomeMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-5xl font-bold mb-3 text-blue-400">Term</div>
            <div className="text-lg mb-6 text-green-400">AI-powered Terminal Assistant with Memory</div>
            <div className="text-sm text-gray-400 mb-4">Type a command or ask a question to get started.</div>
            
            <div className="text-xs text-gray-500 space-y-1 text-center max-w-md">
                <div>💡 <span className="text-gray-400">New:</span> AI remembers conversation context within this session</div>
                <div>📚 Use <span className="bg-gray-700 px-1 rounded">showhistory</span> to view conversation history</div>
                <div>🧹 Use <span className="bg-gray-700 px-1 rounded">clearhistory</span> to clear AI memory</div>
                <div>⬆️⬇️ Use Up/Down arrows to navigate command history</div>
                <div>🔑 Use <span className="bg-gray-700 px-1 rounded">setapikey YOUR_KEY</span> to configure OpenAI API</div>
            </div>
        </div>
    );
};

export default WelcomeMessage;