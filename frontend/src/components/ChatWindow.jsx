import { useRef, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';
import SplineAvatar from './SplineAvatar';

function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Floating Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        {/* Full-screen Spline 3D Scene */}
        <div className="absolute inset-0 z-0">
          <SplineAvatar size="100%" fullScreen />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="hero-title mb-6">
            Your Learning Journey Starts Here
          </h1>
          <p className="hero-subtitle mb-2">
            I won't just give you answers — I'll help you <strong className="text-white">discover them yourself</strong>.
          </p>
          <p className="text-[#71717a] text-sm">
            Ask me anything and let's explore together
          </p>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['🧮 Math Problems', '💻 Coding Help', '🔬 Science Topics', '📝 Writing'].map((chip, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full glass text-sm text-[#a1a1aa] hover:text-white hover:border-[#8b5cf6] transition-all cursor-pointer"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="relative flex-shrink-0 avatar-glow" style={{ width: 48, height: 48 }}>
                <SplineAvatar size={48} />
              </div>
            )}

            <div className={msg.role === 'user' ? 'message-user' : 'message-ai'}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f472b6] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                <FiUser size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-4 mb-8">
            <div className="relative flex-shrink-0 avatar-glow" style={{ width: 48, height: 48 }}>
              <SplineAvatar size={48} />
            </div>
            <div className="message-ai flex items-center gap-2 py-4 px-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] typing-indicator"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] typing-indicator"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] typing-indicator"></span>
              <span className="ml-2 text-sm text-[#71717a]">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default ChatWindow;
