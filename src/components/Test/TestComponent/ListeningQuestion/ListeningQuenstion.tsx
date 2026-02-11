import React from 'react';
import type { ListeningQuestion as ListeningQuestionType } from '../../../../types/test';
import './ListeningQuestion.scss';

interface ListeningQuestionProps {
  question: ListeningQuestionType;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
}

const ListeningQuestion: React.FC<ListeningQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  return (
    <div className="question-content">
      <h2 className="question-header">Part {question.part} - Câu hỏi {question.id}</h2>
      <div className="listening-section">
        <p className="instruction">Nghe đoạn audio và chọn câu trả lời đúng.</p>
        {question.image && (
          <img src={question.image} alt="Question" className="question-image" />
        )}
        <div className="audio-player">
          <svg 
            className="audio-icon"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          <span className="audio-text">Audio Player</span>
          <div className="progress-bar">
            <div className="progress" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>
      <div className="options">
        {question.options.map((opt : any, idx : any) => (
          <label
            key={idx}
            className={`option ${selectedAnswer === idx ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={`q${question.id}`}
              value={idx}
              checked={selectedAnswer === idx}
              onChange={() => onAnswer(idx)}
              className="option-input"
            />
            <span className="option-text">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ListeningQuestion;