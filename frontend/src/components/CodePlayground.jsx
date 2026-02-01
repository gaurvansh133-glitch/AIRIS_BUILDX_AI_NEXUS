import React, { useState, useRef } from 'react';

export default function CodePlayground({ onSubmit, feedback, disabled, level }) {
  const [code, setCode] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (code.trim() && onSubmit) {
      onSubmit(code);
    }
  };

  const handleKeyDown = (e) => {
    // Allow Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      // Set cursor position after indent
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="playground-container">
      <div className="playground-header">
        <div className="playground-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6" />
            <polyline points="8,6 2,12 8,18" />
          </svg>
          Coding Playground
        </div>
        {level && (
          <span className={`level-badge level-${level}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        )}
      </div>

      <div className="editor-container">
        <div className="line-numbers">
          {code.split('\n').map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
          {code === '' && <span>1</span>}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="code-editor"
          placeholder="Write your code here... I'll review it and guide you."
          spellCheck={false}
          disabled={disabled}
        />
      </div>

      <div className="playground-actions">
        <button
          onClick={handleSubmit}
          className="submit-code-btn"
          disabled={!code.trim() || disabled}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          Submit for Review
        </button>
        <button
          onClick={() => setCode('')}
          className="clear-btn"
          disabled={disabled}
        >
          Clear
        </button>
      </div>

      {feedback && feedback.length > 0 && (
        <div className="feedback-container">
          <div className="feedback-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Cortana's Feedback
          </div>
          {feedback.map((fb, idx) => (
            <div key={idx} className={`feedback-item feedback-${fb.type}`}>
              <span className="feedback-type">{fb.type?.toUpperCase()}</span>
              <span className="feedback-message">{fb.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
