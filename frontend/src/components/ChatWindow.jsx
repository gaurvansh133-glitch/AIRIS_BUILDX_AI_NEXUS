import { useRef, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';

function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl font-semibold mb-4">Hi! I'm your Learning Guide</h1>
          <p className="text-[#b4b4b4] text-lg mb-2">
            I won't just give you answers — I'll help you <strong className="text-white">discover them yourself</strong>.
          </p>
          <p className="text-[#8e8e8e] text-sm">
            Share a problem or question, and we'll work through it step by step together.
          </p>

          {/* Example prompts */}
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-xl mx-auto">
            {[
              '🧮 Help me solve: 2x + 5 = 15',
              '💻 How do I write a for loop in Python?',
              '🔬 Explain photosynthesis',
              '📝 Help me understand this essay topic'
            ].map((prompt, i) => (
              <button
                key={i}
                className="p-4 text-left text-sm border border-[#424242] rounded-xl hover:bg-[#2f2f2f] hover:border-[#6366f1] transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-[#2f2f2f]/50 rounded-xl border border-[#424242]">
            <p className="text-sm text-[#b4b4b4]">
              💡 <strong className="text-white">Tip:</strong> The more you explain your thinking, the better I can guide you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
                <RiRobot2Line size={18} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                ? 'bg-[#2f2f2f] text-white'
                : 'bg-transparent'
                }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="markdown-content prose prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#5436DA] flex items-center justify-center flex-shrink-0">
                <FiUser size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
              <RiRobot2Line size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-1 py-3">
              <span className="w-2 h-2 bg-[#8e8e8e] rounded-full typing-indicator" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-[#8e8e8e] rounded-full typing-indicator" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-[#8e8e8e] rounded-full typing-indicator" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
