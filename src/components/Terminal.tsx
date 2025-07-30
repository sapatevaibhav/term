import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  type: 'command'|'output'|'error'|'llm';
  text: string;
}

export default function Terminal() {
  const [messages] = useState<Message[]>([
    {
      type: 'llm',
      text: '**Welcome!**\n\n_Everything you type will render as Markdown._\n\nTry list:\n- Item 1\n- Item 2\n\nCode:\n```\necho hello\n```'
    }
  ]);

  return (
    <div className="terminal-container">
      <div className="terminal-output">
        {messages.map((msg, idx) => (
          <div key={idx} className={`terminal-line ${msg.type}`}>
            {msg.type === 'llm'
              ? <ReactMarkdown>{msg.text}</ReactMarkdown>
              : msg.text}
          </div>
        ))}
      </div>
      <div className="terminal-input">
        <input
          className="font-mono"
          placeholder="Type a command..."
          disabled
        />
      </div>
    </div>
  );
}
