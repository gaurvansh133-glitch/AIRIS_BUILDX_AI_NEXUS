import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import LevelSelector from './LevelSelector';
import DiagnosticCard from './DiagnosticCard';

export default function ChatWindow({ messages, isLoading, onLevelSelect, userLevel, onSend }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Parse structured JSON from message content
  const parseStructuredContent = (content) => {
    if (content.includes('<!--JSON_START-->')) {
      try {
        const jsonMatch = content.match(/<!--JSON_START-->\n([\s\S]*?)\n<!--JSON_END-->/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[1]);
          const textContent = content.replace(/<!--JSON_START-->[\s\S]*?<!--JSON_END-->\n\n/, '');
          return { json: jsonData, text: textContent };
        }
      } catch (e) {
        // Fall back to text
      }
    }
    return { json: null, text: content };
  };

  // Render level selection phase
  const renderLevelSelect = (data) => (
    <div className="level-select-container">
      <div className="phase-header">
        <span className="phase-badge">LEVEL SELECT</span>
      </div>
      <p className="phase-prompt">{data.prompt}</p>
      <LevelSelector onSelect={onLevelSelect} selectedLevel={userLevel} />
    </div>
  );

  // Render quiz phase
  const renderQuiz = (data) => (
    <div className="quiz-container">
      <div className="phase-header">
        <span className="phase-badge quiz">QUIZ</span>
        <span className="phase-title">{data.title}</span>
      </div>
      <div className="quiz-question">{data.question}</div>
      <div className="options-list">
        {data.options?.map((opt, idx) => (
          <div key={idx} className="option-item">
            <span className="option-key">{String.fromCharCode(65 + idx)}</span>
            <span className="option-text">{typeof opt === 'string' ? opt : opt.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Render code review phase
  const renderCodeReview = (data) => (
    <div className="code-review-container">
      <div className="phase-header">
        <span className="phase-badge review">CODE REVIEW</span>
      </div>
      <div className="feedback-list">
        {data.feedback?.map((fb, idx) => (
          <div key={idx} className={`feedback-item feedback-${fb.type}`}>
            <span className="feedback-type">{fb.type?.toUpperCase()}</span>
            <span className="feedback-message">{fb.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Render text diagnostic result phase
  const renderTextDiagnosticResult = (data) => (
    <div className="diagnostic-container">
      <div className="phase-header">
        <span className="phase-badge diagnostic">LEVEL DETECTED</span>
      </div>
      <div className="feedback-item feedback-improvement">
        <span className="feedback-type">SUCCESS</span>
        <span className="feedback-message">
          Teaching level set to <strong>{data.level?.toUpperCase()}</strong>
        </span>
      </div>
    </div>
  );

  // Welcome screen
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-area">
        <div className="welcome-container">
          <div className="welcome-icon" style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #00bcf2, #0078d4)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>

          <h1 className="welcome-title">How can I help you learn today?</h1>
          <p className="welcome-subtitle">
            I'm Cortana, your level-aware Socratic teaching assistant. I'll adapt to your skill level and guide you step-by-step.
          </p>

          <div className="suggestions">
            <div className="suggestion-card" onClick={() => onSend("I want to learn a concept")}>
              <div className="suggestion-title">📚 Learn a concept</div>
              <div className="suggestion-desc">Adaptive difficulty based on your level</div>
            </div>
            <div className="suggestion-card" onClick={() => onSend("Give me a problem to solve")}>
              <div className="suggestion-title">🧩 Solve a problem</div>
              <div className="suggestion-desc">Guided step-by-step discovery</div>
            </div>
            <div className="suggestion-card" onClick={() => onSend("I want to write some code in the playground")}>
              <div className="suggestion-title">💻 Write code</div>
              <div className="suggestion-desc">Use the playground, I'll review</div>
            </div>
            <div className="suggestion-card" onClick={() => onSend("Quiz me on my skills")}>
              <div className="suggestion-title">🎯 Practice skills</div>
              <div className="suggestion-desc">Quizzes and fill-in-the-blank</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const { json, text } = msg.role === 'assistant'
            ? parseStructuredContent(msg.content)
            : { json: null, text: msg.content };

          return (
            <div key={idx} className="message">
              <div className={`message-avatar ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                {msg.role === 'user' ? 'Y' : 'C'}
              </div>

              <div className="message-content">
                <div className="message-role">
                  {msg.role === 'user' ? 'You' : 'Cortana'}
                </div>
                <div className="message-text">
                  {json?.phase === 'LEVEL_SELECT' && renderLevelSelect(json)}
                  {json?.phase === 'DIAGNOSTIC' && <DiagnosticCard data={json} onSend={onSend} />}
                  {json?.phase === 'QUIZ' && renderQuiz(json)}
                  {json?.phase === 'CODE_REVIEW' && renderCodeReview(json)}
                  {json?.phase === 'TEXT_DIAGNOSTIC_RESULT' && renderTextDiagnosticResult(json)}
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="message">
            <div className="message-avatar assistant">C</div>
            <div className="message-content">
              <div className="message-role">Cortana</div>
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
