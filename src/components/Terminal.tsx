import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  type: 'command' | 'output' | 'error' | 'llm';
  text: string;
}

interface TerminalProps {
  aiResponse?: string; // ✅ Optional prop
}

// ✅ Function to strip ANSI escape codes
function stripAnsi(input: string): string {
  return input.replace(/\x1b\[[0-9;]*m/g, '');
}

export default function Terminal({ aiResponse }: TerminalProps) {
  // ✅ Initialize state properly with lazy function to avoid re-runs
  const [messages] = useState<Message[]>(() =>
    aiResponse
      ? [{ type: 'llm', text: aiResponse }]
      : [
          {
            type: 'llm',
            text: `
# AI Response Example
This is **bold**, _italic_, and a list:

- First item
- Second item

Code block:
\`\`\`javascript
console.log("Hello Markdown!");
\`\`\`

⚠️ Error Test:
\x1b[31merror\x1b[0m Something went wrong!

### Malformed Markdown Test
**Bold without close
_Unclosed italic
`,
          },
        ]
  );

  return (
    <div className="terminal-container bg-gray-900 text-white p-4 rounded-lg">
      <div className="terminal-output space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`terminal-line ${msg.type}`}>
            {msg.type === 'llm' ? (
              <ReactMarkdown className="prose prose-invert max-w-none">
                {stripAnsi(msg.text)}
              </ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>
      <div className="terminal-input mt-2">
        <input
          className="font-mono w-full bg-black text-white p-2 rounded"
          placeholder="Type a command..."
          disabled
        />
      </div>
    </div>
  );
}
