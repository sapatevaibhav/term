import React from 'react';

const TerminalMock: React.FC = () => {
  return (
    <div className="terminal">
      <div className="terminal-history">
        <div>Welcome to the terminal</div>
      </div>
      <div className="terminal-input">
        <input type="text" data-testid="terminal-input" role="textbox" />
      </div>
    </div>
  );
};

export default TerminalMock;
