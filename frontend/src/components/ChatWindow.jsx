import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import LevelSelector from './LevelSelector';

export default function ChatWindow({ messages, isLoading, onLevelSelect, userLevel }) {
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

  // Render diagnostic phase
  const renderDiagnostic = (data) => (
    <div className="diagnostic-container">
      <div className="phase-header">
        <span className="phase-badge diagnostic">{data.level?.toUpperCase() || 'DIAGNOSTIC'}</span>
        <span className="phase-title">{data.title}</span>
      </div>
      <p className="phase-message">{data.message}</p>
      <div className="questions-list">
        {data.questions?.map((q, idx) => (
          <div key={q.id} className="question-card">
            <div className="question-number">D{idx + 1}</div>
            <div className="question-content">
              <p className="question-text">{q.text}</p>
              <div className="options-list">
                {q.options?.map(opt => (
                  <div key={opt.key} className="option-item">
                    <span className="option-key">{opt.key}</span>
                    <span className="option-text">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
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
            <div className="suggestion-card">
              <div className="suggestion-title">📚 Learn a concept</div>
              <div className="suggestion-desc">Adaptive difficulty based on your level</div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-title">🧩 Solve a problem</div>
              <div className="suggestion-desc">Guided step-by-step discovery</div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-title">💻 Write code</div>
              <div className="suggestion-desc">Use the playground, I'll review</div>
            </div>
            <div className="suggestion-card">
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
                  {json?.phase === 'DIAGNOSTIC' && renderDiagnostic(json)}
                  {json?.phase === 'QUIZ' && renderQuiz(json)}
                  {json?.phase === 'CODE_REVIEW' && renderCodeReview(json)}
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
