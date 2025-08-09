import React, { useState, useRef, useEffect } from 'react';

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    commandText: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ isOpen, onClose, onSubmit, commandText }) => {
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && passwordRef.current) {
            passwordRef.current.focus();
        }

        if (isOpen) {
            setPassword('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            return;
        }
        setIsSubmitting(true);
        onSubmit(password);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700">
                <div className="flex items-center mb-4">
                    <div className="bg-yellow-600 rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">⚡ Fast Sudo Authentication</h3>
                </div>

                <p className="text-gray-300 mb-4">
                    The following command requires sudo privileges:
                </p>
                <pre className="bg-gray-900 p-2 rounded mb-4 text-green-400 font-mono text-sm overflow-x-auto">
                    {commandText}
                </pre>

                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-400 mb-2">Password:</label>
                        <input
                            ref={passwordRef}
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Password will be cached for 15 minutes for faster subsequent commands.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !password.trim()}
                            className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center ${isSubmitting || !password.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></span>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    ⚡ Authenticate
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordDialog;