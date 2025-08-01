import './App.css'; 
import Terminal from './components/Terminal';

const exampleResponse = `
# AI Summary
Here is some **bold text** and *italic text*.

- Bullet Point 1
- Bullet Point 2

\`\`\`javascript
console.log("Code block test");
\`\`\`

⚠️ Error Message:
\x1b[31merror\x1b[0m Something went wrong!
`;

const malformedResponse = `
### Unclosed *italic*  
**Bold without closing  
- List item
`;

function App() {
  return (
    <div className="h-screen w-full bg-gray-950 text-white p-4 space-y-4">
      {/* ✅ Use both to remove warning and test */}
      <Terminal aiResponse={exampleResponse} />
      <Terminal aiResponse={malformedResponse} />
    </div>
  );
}

export default App;
