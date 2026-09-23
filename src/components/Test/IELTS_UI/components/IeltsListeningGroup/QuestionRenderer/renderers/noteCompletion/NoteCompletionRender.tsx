/**
 * NoteCompletion / SummaryCompletion — Dạng 2 cột
 * LEFT : HTML content của group (có ___26___ placeholder)
 * RIGHT: các ô input đánh số
 */
import React from 'react';
import type { IeltsAnswerState, IeltsQuestionPreview } from '../../../../../../types/ieltsExam.types'; // Chú ý path
import './style.scss'; // Import SCSS màu cứng

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  groupTemplate?: string | null; 
  title?: string;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

const NoteCompletionRender: React.FC<Props> = ({
  questions, answers, groupTemplate, title, onAnswer,
}) => {
  
  // ── TRƯỜNG HỢP FALLBACK: Không có Template thì render List thẻ Card ──
  if (!groupTemplate) {
    return (
      <div className="idp-form-simple-list">
        {questions.map(q => (
          <div className="ielts-q-card" key={q.examQuestionId}>
            <div className="q-card-badge">
              <div className="badge-number">{q.orderIndex}</div>
            </div>
            <div className="q-card-content">
              <div className="q-text" dangerouslySetInnerHTML={{ __html: q.content ?? '' }} />
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
  }

  // ── TRƯỜNG HỢP CHÍNH: Layout 2 cột chuẩn Study4 ──
  return (
    <div className="idp-note-completion-container">
      
      {/* CỘT TRÁI: Nội dung Note/Summary */}
      <div className="note-content-panel">
        {title && <h4 className="note-title">{title}</h4>}
        <div
          className="note-text-content"
          dangerouslySetInnerHTML={{ __html: groupTemplate }}
        />
      </div>

      {/* CỘT PHẢI: Danh sách ô nhập đáp án */}
      <div className="note-inputs-panel">
        <h4 className="panel-heading">Your Answers:</h4>
        <div className="inputs-list">
          {questions.map(q => (
            <div className="note-input-item" key={q.examQuestionId}>
              <span className="badge-number">{q.orderIndex}</span>
              <input
                type="text"
                className="idp-standard-input"
                value={answers[q.examQuestionId]?.textAnswer ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default NoteCompletionRender;