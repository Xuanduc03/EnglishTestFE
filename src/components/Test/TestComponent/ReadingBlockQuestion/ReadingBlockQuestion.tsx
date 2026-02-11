import React from 'react';
import type { ReadingBlockQuestion as ReadingBlockQuestionType, Answer } from '../../../../types/test';
import './ReadingBlockQuestion.scss';

interface ReadingBlockQuestionProps {
  question: ReadingBlockQuestionType;
  answers: Answer[];
  onAnswer: (questionId: number, index: number) => void;
}

const ReadingBlockQuestion: React.FC<ReadingBlockQuestionProps> = ({
  question,
  answers,
  onAnswer,
}) => {
  return (
    <div className="question-content">
      <h2 className="question-header">
        Part {question.part} - Câu hỏi {question.questions[0].id}-{question.questions[question.questions.length - 1].id}
      </h2>
      <div
        className="passage"
        dangerouslySetInnerHTML={{ __html: question.passage }}
      />
      {question.questions.map(q => (
        <div key={q.id} className="sub-question">
          <p className="question-text">
            <strong>{q.id}.</strong> {q.text}
          </p>
          <div className="options">
            {q.options.map((opt : any, idx : any) => (
              <label
                key={idx}
                className={`option ${answers[q.id].answer === idx ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={idx}
                  checked={answers[q.id].answer === idx}
                  onChange={() => onAnswer(q.id, idx)}
                  className="option-input"
                />
                <span className="option-text">
                  ({String.fromCharCode(65 + idx)}) {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReadingBlockQuestion;