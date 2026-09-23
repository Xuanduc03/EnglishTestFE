/**
 * SentenceCompletion — Dạng hoàn thành câu
 * DB: question.content = "You can become more confident by using ______."
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types'; // Sửa path nếu cần
import './style.scss'; // Import file SCSS riêng

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const SentenceCompletionRender: React.FC<Props> = ({ questions, answers, onAnswer }) => (
  <div className="idp-sentence-completion-list">
    {questions.map(q => (
      <div className="ielts-q-card" key={q.examQuestionId}>
        
        {/* Cột 1: Cục badge đánh số */}
        <div className="q-card-badge">
          <div className="badge-number">{q.orderIndex}</div>
        </div>

        {/* Cột 2: Text câu hỏi và ô input nhập liệu */}
        <div className="q-card-content">
          <div
            className="q-text"
            dangerouslySetInnerHTML={{ __html: q.content ?? '' }}
          />
          <div className="q-input-wrapper">
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
        
      </div>
    ))}
  </div>
);

export default SentenceCompletionRender;