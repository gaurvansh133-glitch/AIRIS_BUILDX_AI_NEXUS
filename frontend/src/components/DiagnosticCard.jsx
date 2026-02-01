import React, { useState } from 'react';

export default function DiagnosticCard({ data, onSend }) {
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId, optionKey) => {
    if (submitted) return;
    setSelections(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(selections).length < data.questions.length) return;

    // Construct response string matches the backend expectation
    // Example: "D1: A, D2: B"
    const responseParts = data.questions.map((q, idx) => {
      // Map internal ID (d1) to display index (D1) if needed, or just use ID
      // The backend regex looks for "D\d", so "D1", "D2" is good.
      // Assuming questions have ids like "d1", "d2".
      // Let's format it nicely.
      const qNum = idx + 1;
      const ans = selections[q.id];
      return `D${qNum}: ${ans}`;
    });

    const responseString = responseParts.join(', ');
    onSend(responseString);
    setSubmitted(true);
  };

  const allAnswered = data.questions && Object.keys(selections).length === data.questions.length;

  return (
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
                {q.options?.map(opt => {
                  const isSelected = selections[q.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(q.id, opt.key)}
                      className={`option-item ${isSelected ? 'selected' : ''} ${submitted ? 'disabled' : ''}`}
                      disabled={submitted}
                    >
                      <span className="option-key">{opt.key}</span>
                      <span className="option-text">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="diagnostic-actions">
        <button
          className="submit-diagnostic-btn"
          onClick={handleSubmit}
          disabled={!allAnswered || submitted}
        >
          {submitted ? 'Submitted' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
}
