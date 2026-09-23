/**
 * SentenceCompletion — Dạng hoàn thành câu
 * DB: question.content = "You can become more confident by using ______."
 * UI: badge + câu hỏi + input bên dưới (giống Section 2 mock)
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const SentenceCompletionRender: React.FC<Props> = ({ questions, answers, onAnswer }) => (
  <div className="sentence-completion-list">
    {questions.map(q => (
      <div className="sentence-item" key={q.examQuestionId}>
        <div className="sentence-text-row">
          <span className="q-badge">{q.orderIndex}</span>
          <span
            className="q-text"
            dangerouslySetInnerHTML={{ __html: q.content ?? '' }}
          />
        </div>
        <div className="sentence-input-row">
          <input
            type="text"
            className="idp-standard-input"
            value={answers[q.examQuestionId]?.textAnswer ?? ''}
            onChange={e => onAnswer(q, e.target.value)}
            placeholder={`Max ${q.maxWords} word(s)`}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    ))}
  </div>
);

export default SentenceCompletionRender;