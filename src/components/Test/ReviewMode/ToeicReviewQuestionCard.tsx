import React, { useState } from 'react';
import type { ReviewAnswerDto, AnswerOption } from '../../../pages/Student/FullTest/examAttempt.types';

interface Props {
  question: ReviewAnswerDto;
  displayNumber: number;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const cleanOptionContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  return htmlContent.replace(/^(<p>)?\s*\(?[A-D]\)?[\.\s]+/i, '$1');
};

const ToeicReviewQuestionCard: React.FC<Props> = ({ question, displayNumber }) => {
  const {
    orderIndex,
    content,
    answers,
    selectedAnswerId,
    correctAnswerId,
    isCorrect,
    isAnswered,
    explanation,
  } = question;

  const [showExplanation, setShowExplanation] = useState(true);

  // ... (Giữ nguyên các logic status và styling) ...
  const statusIcon = !isAnswered ? '—' : isCorrect ? '✅' : '❌';
  const statusClass = !isAnswered
    ? 'trp-qcard--skipped'
    : isCorrect
      ? 'trp-qcard--correct'
      : 'trp-qcard--wrong';

  const getOptionClass = (opt: AnswerOption): string => {
    const isCorrectOpt = opt.id === correctAnswerId;
    const isSelectedOpt = opt.id === selectedAnswerId;
    if (isCorrectOpt) return 'trp-option trp-option--correct';
    if (isSelectedOpt && !isCorrectOpt) return 'trp-option trp-option--wrong';
    return 'trp-option';
  };

  const getOptionIcon = (opt: AnswerOption): string | null => {
    if (opt.id === correctAnswerId) return '✅';
    if (opt.id === selectedAnswerId && opt.id !== correctAnswerId) return '❌';
    return null;
  };

  const sortedAnswers = [...answers].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div
      id={`review-q-${orderIndex}`}
      className={`trp-qcard ${statusClass}`}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="trp-qcard__header">
        <div className="trp-qcard__number">
          <span className="trp-qcard__badge">{displayNumber}</span>
          <span className="trp-qcard__status-icon">{statusIcon}</span>
          {!isAnswered && (
            <span className="trp-qcard__skipped-label">Skipped</span>
          )}
        </div>
      </div>

      {/* ── Question content ────────────────────────────────────── */}
      {content && (
        <div
          className="trp-qcard__content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* ── Answer options ──────────────────────────────────────── */}
      <div className="trp-qcard__options">
        {sortedAnswers.map((opt, idx) => {
          const icon = getOptionIcon(opt);
          // 👇 GỌI HÀM LÀM SẠCH Ở ĐÂY 👇
          const cleanedContent = cleanOptionContent(opt.content);

          return (
            <div key={opt.id} className={getOptionClass(opt)}>
              <span className="trp-option__letter">{LETTERS[idx] ?? String(idx + 1)}</span>
              <span
                className="trp-option__text"
                dangerouslySetInnerHTML={{ __html: cleanedContent }}
              />
              {icon && <span className="trp-option__icon">{icon}</span>}
            </div>
          );
        })}
      </div>

      {/* ── Explanation ─────────────────────────────────────────── */}
      {explanation ? (
        <div className="trp-explanation">
          <button
            className="trp-explanation__toggle"
            onClick={() => setShowExplanation(prev => !prev)}
          >
            💡 Explanation {showExplanation ? '▲' : '▼'}
          </button>
          {showExplanation && (
            <div
              className="trp-explanation__body"
              dangerouslySetInnerHTML={{ __html: explanation }}
            />
          )}
        </div>
      ) : (
        <div className="trp-explanation trp-explanation--empty">
          💡 No explanation available for this question.
        </div>
      )}
    </div>
  );
};

export default ToeicReviewQuestionCard;