import React from 'react';

export default function LevelSelector({ onSelect, selectedLevel }) {
  const levels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: "I'm new / shaky fundamentals",
      icon: '🌱',
      color: '#22c55e'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'I know basics but struggle with application',
      icon: '🌿',
      color: '#f59e0b'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'I understand concepts, want guided problem solving',
      icon: '🌳',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="level-selector">
      <div className="level-selector-title">Select Your Level</div>
      <div className="level-options">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`level-option ${selectedLevel === level.id ? 'selected' : ''}`}
            style={{ '--level-color': level.color }}
          >
            <span className="level-icon">{level.icon}</span>
            <div className="level-info">
              <span className="level-name">{level.name}</span>
              <span className="level-desc">{level.description}</span>
            </div>
            {selectedLevel === level.id && (
              <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
