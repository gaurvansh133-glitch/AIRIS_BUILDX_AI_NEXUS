import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
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
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end bg-[#2f2f2f] rounded-2xl border border-[#424242] focus-within:border-[#6b6b6b] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-[#8e8e8e] resize-none py-4 px-4 outline-none auto-resize-textarea"
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`p-3 m-1.5 rounded-xl transition-all duration-200 ${message.trim() && !disabled
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-[#424242] text-[#8e8e8e] cursor-not-allowed'
              }`}
          >
            <FiSend size={18} />
          </button>
        </div>
      </form>
      <p className="text-center text-xs text-[#8e8e8e] mt-3">
        Remember: Explaining your thinking helps you learn better!
      </p>
    </div>
  );
}

export default MessageInput;
