import React from 'react';
import {
  isFillInType, isMcqMulti,
  type IeltsReviewQuestion,
} from '../../../types/ieltsExam.types';

export const getQuestionStatus = (q: IeltsReviewQuestion): 'correct' | 'wrong' | 'skip' => {
  if (!q.isAnswered) return 'skip';
  return q.isCorrect ? 'correct' : 'wrong';
};

interface QuestionCardProps {
  question: IeltsReviewQuestion;
  cardRef?: React.Ref<HTMLDivElement>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question: q, cardRef }) => {
  const status = getQuestionStatus(q);
  const isFillIn = isFillInType(q.questionType);
  const isMulti  = isMcqMulti(q.questionType);
  const isMcq    = !isFillIn && (q.options.length > 0);

  // Resolve user answer label for fill-in / single
  const userAnswerLabel = (() => {
    if (!q.isAnswered) return null;
    if (isFillIn) return q.userTextAnswer ?? null;
    if (isMulti) return (q.userSelectedIds || []).join(', ') || null;
    // Single: find option content
    const opt = q.options.find(o => o.id === q.userSelectedId);
    return opt?.content ?? q.userSelectedId ?? null;
  })();

  // Correct answers as display string
  const correctLabels = q.correctAnswers
    .map(a => a.content ?? '')
    .filter(Boolean)
    .join(' / ');

  return (
    <div
      className={`q-card q-card--${status}`}
      id={`q-${q.orderIndex}`}
      ref={cardRef}
    >
      {/* Header */}
      <div className="q-card__head">
        <div className={`q-num q-num--${status}`}>{q.orderIndex}</div>
        <div className="q-text">{q.content}</div>
      </div>

      {/* Body */}
      <div className="q-card__body">

        {/* ── Fill-in answers ── */}
        {isFillIn && (
          <>
            <div className="answer-row">
              <span className="answer-row__label">Your answer</span>
              {q.isAnswered && userAnswerLabel
                ? (
                  <span className={`answer-row__val answer-row__val--${q.isCorrect ? 'correct' : 'wrong'}`}>
                    {userAnswerLabel}
                  </span>
                )
                : (
                  <span className="answer-row__val answer-row__val--skip">
                    not answered
                  </span>
                )
              }
            </div>
            {!q.isCorrect && (
              <div className="answer-row">
                <span className="answer-row__label">Correct</span>
                <span className="answer-row__val answer-row__val--answer">
                  {correctLabels}
                </span>
              </div>
            )}
          </>
        )}

        {/* ── MCQ options ── */}
        {isMcq && (
          <div className="options-list">
            {q.options.map(opt => {
              const isCorrectOpt = opt.isCorrect;
              const isUserPick = isMulti
                ? (q.userSelectedIds || []).includes(opt.id)
                : q.userSelectedId === opt.id;

              let cls = 'option-item';
              let iconCls = 'option-icon option-icon--neutral';
              let iconChar = '';

              if (isCorrectOpt) {
                cls += ' option-item--correct';
                iconCls = 'option-icon option-icon--correct';
                iconChar = '✓';
              } else if (isUserPick && !isCorrectOpt) {
                cls += ' option-item--user-wrong';
                iconCls = 'option-icon option-icon--wrong';
                iconChar = '✗';
              }

              return (
                <div key={opt.id} className={cls}>
                  <div className={iconCls}>{iconChar}</div>
                  <span>{opt.content}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Explanation ── */}
        {q.explanation && (
          <div className="explain-box">
            <div className="explain-box__title">Explanation</div>
            <div className="explain-box__text">{q.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
