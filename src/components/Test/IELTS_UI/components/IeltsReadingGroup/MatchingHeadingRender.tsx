/**
 * MatchingHeadingRender — "Choose the correct heading i–x for each paragraph"
 * FIX: dùng selectedAnswerId (option.id string) thay selectedOptionIndex (number)
 *      onAnswer nhận string thay number
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../types/ieltsExam.types';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  // FIX: value là string (option.id), không phải number index
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const toRoman = (n: number): string => {
  const vals = ['x','ix','viii','vii','vi','v','iv','iii','ii','i'];
  const nums  = [10,   9,    8,   7,   6,  5,   4,   3,   2,  1];
  let result = '', rem = n + 1;
  for (let i = 0; i < nums.length; i++)
    while (rem >= nums[i]) { result += vals[i]; rem -= nums[i]; }
  return result;
};

const MatchingHeadingRender: React.FC<Props> = ({ questions, answers, onAnswer }) => {
  const sharedOptions = questions[0]?.options ?? [];

  return (
    <div className="matching-heading-block">
      {/* List of headings */}
      <div className="headings-list-box">
        <p className="headings-list-title"><strong>List of Headings</strong></p>
        <ul className="headings-list">
          {sharedOptions.map((opt, idx) => (
            <li key={opt.id}>
              <strong>{toRoman(idx)}</strong>&nbsp;&nbsp;{opt.content}
            </li>
          ))}
        </ul>
      </div>

      {/* Questions */}
      <div className="matching-heading-questions">
        {questions.map(q => {
          // FIX: đọc selectedAnswerId (string id), không phải selectedOptionIndex
          const selectedId = answers[q.examQuestionId]?.selectedAnswerId ?? '';

          return (
            <div className="mh-item" key={q.examQuestionId}>
              <span className="q-badge">{q.orderIndex}</span>
              <span
                className="mh-paragraph-label"
                dangerouslySetInnerHTML={{ __html: q.content ?? '' }}
              />
              <select
                className="idp-select"
                value={selectedId}
                onChange={e => onAnswer(q, e.target.value)}
              >
                <option value="">— Chọn heading —</option>
                {sharedOptions.map((opt, idx) => (
                  // FIX: value = opt.id (string), không phải idx (number)
                  <option key={opt.id} value={opt.id}>
                    {toRoman(idx)}&nbsp;&nbsp;{opt.content}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingHeadingRender;