import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative px-6 pb-6 pt-2">
      {/* Gradient line above input */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent"></div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative glass-strong rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 focus-within:shadow-lg focus-within:shadow-purple-500/20 focus-within:border-[#8b5cf6]/50">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... Let's learn together ✨"
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-white placeholder:text-[#71717a] py-4 pl-5 pr-28 resize-none focus:outline-none text-sm disabled:opacity-50"
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />

          {/* Action Buttons */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {/* Voice Input */}
            <button
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#71717a] hover:text-[#8b5cf6] hover:bg-white/5 transition-all"
            >
              <FiMic size={18} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className="send-button w-10 h-10 disabled:opacity-30 disabled:hover:shadow-none"
            >
              <FiSend size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Footer with sparkle */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <HiSparkles className="text-[#8b5cf6] text-xs" />
          <p className="text-[10px] text-[#71717a] tracking-wide">
            Powered by AI • Explaining your thinking helps you learn better
          </p>
          <HiSparkles className="text-[#06b6d4] text-xs" />
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
