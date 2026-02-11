import React from 'react';
import type { Answer } from '../../../../types/test';
import { TOTAL_QUESTIONS } from '../../../../constants/test';
import './BottomQuestionBar.scss';

interface BottomQuestionBarProps {
  currentQuestion: number;
  answers: Answer[];
  onNavigate: (id: number) => void;
  totalQuestions?: number;
}

const BottomQuestionBar: React.FC<BottomQuestionBarProps> = ({
  currentQuestion,
  answers,
  onNavigate,
  totalQuestions = TOTAL_QUESTIONS,
}) => {
  return (
    <div className="bottom-question-bar">
      <div className="bar-container">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((id) => {
          const isCurrent = id === currentQuestion;
          const isAnswered = answers[id]?.answer !== null;
          const isMarked = answers[id]?.marked;
          return (
            <button
              key={id}
              className={`bar-item ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isMarked ? 'marked' : ''}`}
              onClick={() => onNavigate(id)}
              title={`Câu ${id}${isAnswered ? ' (Đã làm)' : ''}${isMarked ? ' - Đánh dấu' : ''}`}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomQuestionBar;


