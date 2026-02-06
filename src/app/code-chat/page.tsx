"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage, { Message } from "@/components/ChatMessage";

const SAMPLE_RESPONSES: Record<string, string> = {
  default: `I can help you with code questions! Try asking me about:

- Data structures and algorithms
- Debugging code
- Explaining concepts like recursion, closures, or async/await
- Writing functions in Python, JavaScript, or other languages

What would you like to learn about?`,

  sort: `Here's how to implement a bubble sort algorithm:

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(numbers))
# Output: [11, 12, 22, 25, 34, 64, 90]
\`\`\`

Bubble sort works by repeatedly stepping through the list, comparing adjacent elements and swapping them if they are in the wrong order. The pass through the list is repeated until the list is sorted.

**Time complexity:** O(n\u00B2) in the worst case. For better performance, consider using merge sort O(n log n) or Python's built-in \`sorted()\` which uses Timsort.`,

  recursion: `Recursion is when a function calls itself to solve a problem by breaking it into smaller sub-problems.

Here's a classic example \u2014 computing the factorial:

\`\`\`javascript
function factorial(n) {
  // Base case: stop the recursion
  if (n <= 1) return 1;

  // Recursive case: n * factorial of (n-1)
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
// 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

Every recursive function needs:
1. **Base case** \u2014 a condition that stops the recursion
2. **Recursive case** \u2014 where the function calls itself with a simpler input

Without a base case, you'll get infinite recursion (and a stack overflow error).`,

  async: `\`async/await\` is syntactic sugar for working with Promises in JavaScript, making asynchronous code read like synchronous code.

\`\`\`javascript
// Without async/await (using .then chains)
function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => response.json())
    .then(user => {
      console.log(user.name);
      return user;
    })
    .catch(error => console.error(error));
}

// With async/await (much cleaner!)
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const user = await response.json();
    console.log(user.name);
    return user;
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

Key concepts:
- \`async\` marks a function as asynchronous (it always returns a Promise)
- \`await\` pauses execution until the Promise resolves
- Use \`try/catch\` for error handling instead of \`.catch()\``,

  react: `Here's a simple React component with state management using hooks:

\`\`\`typescript
import { useState, useEffect } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: input, completed: false }
    ]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && addTodo()}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{
              textDecoration: todo.completed ? "line-through" : "none"
            }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

This demonstrates \`useState\` for managing state and event handling in React. The component maintains a list of todos and lets users add and toggle them.`,
};

function getResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("sort") || lower.includes("algorithm")) return SAMPLE_RESPONSES.sort;
  if (lower.includes("recursion") || lower.includes("recursive")) return SAMPLE_RESPONSES.recursion;
  if (lower.includes("async") || lower.includes("await") || lower.includes("promise")) return SAMPLE_RESPONSES.async;
  if (lower.includes("react") || lower.includes("component") || lower.includes("hook")) return SAMPLE_RESPONSES.react;
  return SAMPLE_RESPONSES.default;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome to Code Chat! I'm here to help you with programming questions, code review, and learning new concepts. Ask me anything about code!",
    timestamp: new Date(),
  },
];

export default function CodeChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate response delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getResponse(trimmed),
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "How does recursion work?",
    "Explain async/await in JavaScript",
    "Show me a sorting algorithm",
    "Build a React component with hooks",
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Code Chat</h2>
            <p className="text-xs text-slate-500">
              Ask questions about code, get explanations, and learn programming concepts
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
                <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips - only show when there's just the welcome message */}
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-wrap gap-2 mt-4">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-academic-50 hover:border-academic-200 hover:text-academic-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a coding question... (Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent placeholder-slate-400"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-academic-600 text-white rounded-xl hover:bg-academic-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
