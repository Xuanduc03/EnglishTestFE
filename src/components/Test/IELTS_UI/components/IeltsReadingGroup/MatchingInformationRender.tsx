/**
 * MatchingSentenceEndsRender — "Complete each sentence with the correct ending A-K"
 * FIX: dùng selectedAnswerId (option.id string) thay selectedOptionIndex (number)
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../types/ieltsExam.types';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  // FIX: value là string (option.id)
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const MatchingSentenceEndsRender: React.FC<Props> = ({ questions, answers, onAnswer }) => {
  const sharedOptions = questions[0]?.options ?? [];

  return (
    <div className="sentence-endings-block">
      {/* Options A-K list */}
      <ul className="options-letter-list">
        {sharedOptions.map((opt, idx) => (
          <li key={opt.id}>
            <strong>{String.fromCharCode(65 + idx)}.</strong> {opt.content}
          </li>
        ))}
      </ul>

      {/* Questions */}
      <div className="sentence-endings-list">
        {questions.map(q => {
          // FIX: đọc selectedAnswerId
          const selectedId = answers[q.examQuestionId]?.selectedAnswerId ?? '';

          return (
            <div className="se-item" key={q.examQuestionId}>
              <div className="se-q-row">
                <span className="q-badge">{q.orderIndex}</span>
                <span
                  className="q-text"
                  dangerouslySetInnerHTML={{ __html: q.content ?? '' }}
                />
              </div>
              <div className="se-input-row">
                <select
                  className="idp-select short-select"
                  value={selectedId}
                  onChange={e => onAnswer(q, e.target.value)}
                >
                  <option value="">—</option>
                  {sharedOptions.map((opt, idx) => (
                    // FIX: value = opt.id, hiển thị chữ cái A/B/C...
                    <option key={opt.id} value={opt.id}>
                      {String.fromCharCode(65 + idx)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingSentenceEndsRender;