import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="mb-2">
            <div className="inline-block w-4 h-4 border-2 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
        </div>
    );
};

export default Spinner;
