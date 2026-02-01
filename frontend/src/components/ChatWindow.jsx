import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome screen
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-area">
        <div className="welcome-container">
          {/* Logo */}
          <svg className="welcome-icon" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500879C16.1708 0.495051 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12442 32.3138C5.18791 34.166 6.81233 35.6324 8.76321 36.5015C10.7141 37.3706 12.8907 37.5974 14.9789 37.1492C15.9208 38.2107 17.0786 39.0588 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4991C24.6307 40.5049 26.7133 39.8314 28.4418 38.5765C30.1702 37.3217 31.4556 35.5502 32.1119 33.5179C33.5028 33.2332 34.8167 32.6547 35.9659 31.821C37.1151 30.9873 38.0729 29.9178 38.7752 28.684C39.847 26.8371 40.3046 24.6979 40.0818 22.5765C39.8591 20.4551 38.9681 18.4592 37.5372 16.8762L37.5324 16.8707Z" fill="#10a37f" />
          </svg>

          <h1 className="welcome-title">How can I help you today?</h1>
          <p className="welcome-subtitle">
            I'm here to help you learn. Ask me anything and I'll guide you through the steps.
          </p>

          {/* Suggestions */}
          <div className="suggestions">
            <div className="suggestion-card">
              <div className="suggestion-title">Explain a concept</div>
              <div className="suggestion-desc">Help me understand something new</div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-title">Solve a problem</div>
              <div className="suggestion-desc">Guide me through step by step</div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-title">Review my code</div>
              <div className="suggestion-desc">Find bugs and improvements</div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-title">Brainstorm ideas</div>
              <div className="suggestion-desc">Creative thinking together</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            {/* Avatar */}
            <div className={`message-avatar ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              {msg.role === 'user' ? 'Y' : 'G'}
            </div>

            {/* Content */}
            <div className="message-content">
              <div className="message-role">
                {msg.role === 'user' ? 'You' : 'ChatGPT'}
              </div>
              <div className="message-text">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="message">
            <div className="message-avatar assistant">G</div>
            <div className="message-content">
              <div className="message-role">ChatGPT</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
