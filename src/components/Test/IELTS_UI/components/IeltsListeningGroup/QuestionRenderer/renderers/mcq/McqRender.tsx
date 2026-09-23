import React from 'react';
import {
  IeltsQuestionType,
  type IeltsAnswerState,
  type IeltsQuestionPreview,
} from '../../../../../../types/ieltsExam.types';
import './style.scss';

interface Props {
  questions: IeltsQuestionPreview[];
  answers: Record<string, IeltsAnswerState>;
  onAnswer: (q: IeltsQuestionPreview, value: string) => void;
}

// ── MultipleChoice TWO ────────────────────────────────────
const MultiChoiceBlock: React.FC<Props> = ({ questions, answers, onAnswer }) => (
  <div className="idp-mcq-container">
    {questions.map(q => {
      const selectedIds = answers[q.examQuestionId]?.selectedAnswerIds ?? [];
      return (
        <div className="ielts-q-card" key={q.examQuestionId}>
          <div className="q-card-badge">
            <div className="badge-number-circle">{q.orderIndex}</div>
          </div>
          <div className="q-card-content">
            {q.content && <div className="q-text" dangerouslySetInnerHTML={{ __html: q.content }} />}
            <div className="mcq-options-list">
              {q.options.map(opt => {
                const isSelected = selectedIds.includes(opt.id);
                const isDisabled = !isSelected && selectedIds.length >= 2;
                return (
                  <label key={opt.id} className={`mcq-option-label${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}>
                    <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => onAnswer(q, opt.id)} />
                    <span className="opt-text">{opt.content}</span>
                  </label>
                );
              })}
            </div>
            <p className="mcq-multi-hint">Choose TWO answers · {selectedIds.length}/2 selected</p>
          </div>
        </div>
      );
    })}
  </div>
);

// ── SingleChoice ──────────────────────────────────────────
const SingleChoiceBlock: React.FC<Props> = ({ questions, answers, onAnswer }) => (
  <div className="idp-mcq-container">
    {questions.map(q => {
      const selectedId = answers[q.examQuestionId]?.selectedAnswerId ?? '';
      return (
        <div className="ielts-q-card" key={q.examQuestionId}>
          <div className="q-card-badge">
            <div className="badge-number-circle">{q.orderIndex}</div>
          </div>
          <div className="q-card-content">
            {q.content && <div className="q-text" dangerouslySetInnerHTML={{ __html: q.content }} />}
            <div className="mcq-options-list">
              {q.options.map(opt => (
                <label key={opt.id} className={`mcq-option-label${selectedId === opt.id ? ' selected' : ''}`}>
                  <input type="radio" name={`mcq-${q.examQuestionId}`} checked={selectedId === opt.id} onChange={() => onAnswer(q, opt.id)} />
                  <span className="opt-text">{opt.content}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ── MapLabeling — mỗi câu dropdown chọn chữ cái ──────────
// JSON: mỗi câu có đúng 1 option (đáp án đúng H/E/F/G/C/D)
// UI đúng: dropdown list tất cả chữ cái từ pool tất cả câu trong block
const MapLabelingBlock: React.FC<Props> = ({ questions, answers, onAnswer }) => {
  // Build pool: gom tất cả options từ tất cả câu, sort chữ cái
  const pool = questions.flatMap(q => q.options);

  if (pool.length === 0) {
    // Không có options → input text tự gõ
    return (
      <div className="idp-mcq-container">
        {questions.map(q => (
          <div className="ielts-q-card" key={q.examQuestionId}>
            <div className="q-card-badge"><div className="badge-number-circle">{q.orderIndex}</div></div>
            <div className="q-card-content">
              {q.content && <div className="q-text" dangerouslySetInnerHTML={{ __html: q.content }} />}
              <input type="text" className="idp-fill-input"
                value={answers[q.examQuestionId]?.textAnswer ?? ''}
                onChange={e => onAnswer(q, e.target.value)}
                placeholder="Your answer..." />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="idp-mcq-container">
      {questions.map(q => {
        const selectedId = answers[q.examQuestionId]?.selectedAnswerId ?? '';
        return (
          <div className="ielts-q-card" key={q.examQuestionId}>
            <div className="q-card-badge"><div className="badge-number-circle">{q.orderIndex}</div></div>
            <div className="q-card-content">
              {q.content && <div className="q-text" dangerouslySetInnerHTML={{ __html: q.content }} />}
              {/* Dropdown chọn từ pool tất cả chữ cái */}
              <select className="idp-select" value={selectedId} onChange={e => onAnswer(q, e.target.value)}>
                <option value="">— Select —</option>
                {pool.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.content}</option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────
const McqRender: React.FC<Props> = (props) => {
  const type = props.questions[0]?.questionType;
  if (!type) return null;

  if (type === IeltsQuestionType.MultipleChoice) return <MultiChoiceBlock {...props} />;
  if (type === IeltsQuestionType.MapLabeling) return <MapLabelingBlock {...props} />;
  return <SingleChoiceBlock {...props} />;
};

export default McqRender;