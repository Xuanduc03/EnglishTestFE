import React from 'react';
import type { ReadingSingleQuestion as ReadingSingleQuestionType } from '../../../../types/test';
import './ReadingSingleQuestion.scss';

interface ReadingSingleQuestionProps {
  question: ReadingSingleQuestionType;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
}

const ReadingSingleQuestion: React.FC<ReadingSingleQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  return (
    <div className="question-content">
      <h2 className="question-header">Part {question.part} - Câu hỏi {question.id}</h2>
      <p
        className="question-text"
        dangerouslySetInnerHTML={{
          __html: question.question.replace('_______', '<span class="blank">_______</span>'),
        }}
      />
      <div className="options">
        {question.options.map((opt :any, idx : any) => (
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
            <span className="option-text">
              ({String.fromCharCode(65 + idx)}) {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ReadingSingleQuestion;