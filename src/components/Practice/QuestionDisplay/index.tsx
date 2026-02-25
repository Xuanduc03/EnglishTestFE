import React, { useState } from "react";
import { FlagFilled } from "@ant-design/icons";
import type { PracticeQuestionDto } from "../Types/practice.type";
import "./QuestionDisplay.scss";

interface QuestionDisplayProps {
  questions: PracticeQuestionDto[];
  partNumber: number;
  answersMap: Map<string, string>;
  markedSet: Set<string>;
  onSelectAnswer: (questionId: string, answerId: string) => void;
  onMarkForReview: (questionId: string) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  questions,
  partNumber,
  answersMap,
  markedSet,
  onSelectAnswer,
  onMarkForReview,
}) => {
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const groupData = questions[0];
  const isGroupLayout = !!groupData.groupId;
  const isBlindListening = partNumber === 1 || partNumber === 2;

  // ── Helper: Audio Player ──────────────────────────
  const renderAudioPlayer = (url: string, key?: string) => (
    <div className="qd-audio-player" key={key}>
      <audio controls src={url} preload="metadata">
        Trình duyệt của bạn không hỗ trợ file âm thanh này.
      </audio>
    </div>
  );

  // ── CỘT TRÁI (layout-split): Đoạn văn / Audio nhóm ─────
  const renderGroupContent = () => {
    if (!groupData.groupId) return null;

    return (
      <div className="qd-group-content">
        {/* Part 7: Multiple Passages */}
        {groupData.passages && groupData.passages.length > 0 && (
          <div className="qd-passages">
            {groupData.passages.map((passage) => (
              <div key={passage.id} className="qd-passage-card">
                {passage.title && (
                  <div className="qd-passage-title">{passage.title}</div>
                )}
                <div className="qd-passage-body" dangerouslySetInnerHTML={{ __html: passage.content }} />
              </div>
            ))}
          </div>
        )}

        {/* Part 3, 4: Group Audio & Transcript */}
        {groupData.groupMedia && groupData.groupMedia.length > 0 && (
          <div className="qd-group-media">
            {groupData.groupMedia.map((media) => renderAudioPlayer(media.url, media.id))}
            {groupData.groupContent && (
              <details className="qd-transcript">
                <summary>Xem transcript</summary>
                <div dangerouslySetInnerHTML={{ __html: groupData.groupContent }} />
              </details>
            )}
          </div>
        )}

        {/* Part 6: Text passage */}
        {groupData.groupContent && (!groupData.groupMedia || groupData.groupMedia.length === 0) && (
          <div className="qd-passage-card">
            <div className="qd-passage-body" dangerouslySetInnerHTML={{ __html: groupData.groupContent }} />
          </div>
        )}
      </div>
    );
  };

  // ── Render từng câu hỏi ───────────────────────────
  const renderQuestion = (q: PracticeQuestionDto) => {
    const selectedAnswerId = answersMap.get(q.questionId);
    const hasAnswered = !!selectedAnswerId;
    const isMarked = markedSet.has(q.questionId);

    const sortedAnswers = [...q.answers].sort((a, b) => a.orderIndex - b.orderIndex);
    const correctIndex = sortedAnswers.findIndex((a) => a.isCorrect);
    const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : "";

    const getAnswerState = (answerId: string, isCorrect: boolean) => {
      if (!hasAnswered) return "default";
      if (answerId === selectedAnswerId) return isCorrect ? "correct" : "wrong";
      if (isCorrect) return "correct";
      return "default";
    };

    return (
      <div key={q.questionId} className="qd-single-question">

        {/* Header: số câu + flag — full width */}
        <div className="qd-header">
          <span className="qd-question-number">
            Câu {q.questionNumber}
            {q.totalQuestionsInGroup && (
              <span className="qd-group-badge">
                {q.questionIndexInGroup}/{q.totalQuestionsInGroup}
              </span>
            )}
          </span>
          <button
            className={`qd-flag-btn ${isMarked ? "active" : ""}`}
            onClick={() => onMarkForReview(q.questionId)}
            title={isMarked ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
          >
            <FlagFilled />
          </button>
        </div>

        {/* Body: 2 cột — Trái: câu hỏi/media | Phải: đáp án */}
        <div className="qd-body">

          {/* CỘT TRÁI: Media + Nội dung câu hỏi */}
          <div className="qd-body__left">
            {(q.hasImage || q.hasAudio) && (
              <div className="qd-question-media">
                {q.hasImage && q.imageUrl && (
                  <img src={q.imageUrl} alt="illustration" className="qd-media-image" />
                )}
                {q.hasAudio && q.audioUrl && (
                  <div className="qd-audio-container">
                    <audio controls src={q.audioUrl} preload="auto">
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                )}
              </div>
            )}

            {q.content && (
              <div className="qd-question-text" dangerouslySetInnerHTML={{ __html: q.content }} />
            )}
          </div>

          {/* CỘT PHẢI: Đáp án + Result panel */}
          <div className="qd-body__right">
            <div className="qd-answers">
              {sortedAnswers.map((answer, index) => {
                const state = getAnswerState(answer.id, answer.isCorrect);
                const letterLabel = String.fromCharCode(65 + index);

                return (
                  <div
                    key={answer.id}
                    className={`qd-answer-row qd-answer-row--${state} ${isBlindListening ? "qd-blind-row" : ""}`}
                    onClick={() => !hasAnswered && onSelectAnswer(q.questionId, answer.id)}
                  >
                    <div className="qd-answer-left">
                      <span className={`qd-answer-radio qd-answer-radio--${state}`}>
                        {state === "correct" && hasAnswered && (
                          <span className="qd-icon qd-icon--correct">✓</span>
                        )}
                        {state === "wrong" && (
                          <span className="qd-icon qd-icon--wrong">✕</span>
                        )}
                        {state === "default" && (
                          <span className={`qd-radio-dot ${selectedAnswerId === answer.id ? "checked" : ""}`} />
                        )}
                      </span>
                      <span className="qd-answer-label">{letterLabel}.</span>
                    </div>

                    {(!isBlindListening || hasAnswered) && (
                      <div className="qd-answer-content">
                        {answer.media && answer.media.length > 0 ? (
                          <div className="qd-answer-media">
                            {answer.media.map((m) => renderAudioPlayer(m.url, m.id))}
                            {answer.content && <span>{answer.content}</span>}
                          </div>
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: answer.content }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Result Panel */}
            {hasAnswered && (
              <div className="qd-result-panel">
                <div className="qd-correct-answer">
                  <span className="qd-result-label">Đáp án đúng:</span>
                  <span className="qd-result-value">{correctLetter}</span>
                </div>

                {q.explanation && (
                  <div className="qd-explanation">
                    <button
                      className="qd-explanation-toggle"
                      onClick={() =>
                        setShowExplanation((prev) => ({
                          ...prev,
                          [q.questionId]: !prev[q.questionId],
                        }))
                      }
                    >
                      {showExplanation[q.questionId] ? "Ẩn giải thích ▲" : "Xem giải thích ▼"}
                    </button>
                    {showExplanation[q.questionId] && (
                      <div
                        className="qd-explanation-body"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  };

  // ── MAIN RENDER ──────────────────────────────────
  return (
    <div className={`qd-card ${isGroupLayout ? "layout-split" : "layout-single"}`}>

      {/* layout-split: Cột trái = đoạn văn/audio, Cột phải = câu hỏi */}
      {isGroupLayout && (
        <div className="qd-left-pane">
          <div className="qd-left-pane__inner">
            {renderGroupContent()}
          </div>
        </div>
      )}

      <div className="qd-right-pane">
        <div className="qd-questions-list">
          {questions.map((q) => renderQuestion(q))}
        </div>
      </div>

    </div>
  );
};

export default QuestionDisplay;