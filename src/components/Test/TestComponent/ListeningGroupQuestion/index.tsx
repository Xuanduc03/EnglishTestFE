import React, { useRef, useState } from 'react';
import type { Answer } from '../../../../types/test';
import type { ExamQuestionPreview } from '../../../../pages/Student/FullTest/examAttempt.types';
import './ListeningGroupQuestion.scss';

interface ListeningGroupQuestionProps {
  groupQuestions: ExamQuestionPreview[];
  currentQuestion: number;
  answers: Answer[];
  onAnswer: (questionId: number, answerIndex: number) => void;
  onAudioEnd?: () => void;
  globalStartIndex: number;
}

const LABELS = ['A', 'B', 'C', 'D'];
const stripPrefix = (text: string) => text.replace(/^\s*\([A-D]\)\s*/i, '').replace(/^\s*[A-D]\.\s*/i, '').trim();

const ListeningGroupQuestion: React.FC<ListeningGroupQuestionProps> = ({
  groupQuestions,
  currentQuestion,
  answers,
  onAnswer,
  onAudioEnd,
  globalStartIndex,
}) => {
  const first = groupQuestions[0];
  const audioUrl = first.groupAudioUrl ?? first.audioUrl ?? '';
  const groupContent = first.groupContent ?? '';
  const groupImageUrl = first.groupImageUrl ?? null;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playCount, setPlayCount] = useState(0);

  const handleAudioEnded = () => {
    const next = playCount + 1;
    setPlayCount(next);
    if (next < 2 && audioRef.current) {
      audioRef.current.play();
    } else {
      onAudioEnd?.();
    }
  };

  // ==========================================
  // COMPONENT CỘT TRÁI: NGỮ CẢNH (ẢNH/ĐOẠN VĂN)
  // ==========================================
  const LeftPanel = (
    <div className="iig-panel iig-left-panel">
      <div className="iig-instruction">
        Select the best response to each question.
      </div>
      
      {groupImageUrl && (
        <div className="iig-image-wrapper">
          <img src={groupImageUrl} alt="Graphic context" />
        </div>
      )}

      {groupContent && (
        <div className="iig-transcript-wrapper">
          <div dangerouslySetInnerHTML={{ __html: groupContent.replace(/\n/g, '<br/>') }} />
        </div>
      )}
    </div>
  );

  // ==========================================
  // COMPONENT CỘT PHẢI: CÂU HỎI VÀ ĐÁP ÁN
  // ==========================================
  const RightPanel = (
    <div className="iig-panel iig-right-panel">
      <div className="iig-panel-header">Question</div>
      
      <div className="iig-questions-list">
        {groupQuestions.map((q, qi) => {
          const globalIdx = globalStartIndex + qi;
          const selectedAnswer = answers[globalIdx]?.answer ?? null;

          return (
            <div key={q.examQuestionId} className="iig-question-block">
              <div className="iig-question-text">
                <strong>{globalIdx}. </strong>
                {q.content ? (
                  <span dangerouslySetInnerHTML={{ __html: q.content }} />
                ) : (
                  <span>Question {globalIdx}</span>
                )}
              </div>

              {q.imageUrl && <img src={q.imageUrl} alt="Specific" className="iig-specific-img" />}

              <div className="iig-options-container">
                {q.answers.map((a, ai) => {
                  const isSelected = selectedAnswer === ai;
                  return (
                    <label key={a.id} className="iig-option-row">
                      <input
                        type="radio"
                        name={`q-${globalIdx}`}
                        checked={isSelected}
                        onChange={() => onAnswer(globalIdx, ai)}
                        className="iig-radio-input"
                      />
                      <span className="iig-option-letter">({LABELS[ai]})</span>
                      <span
                        className="iig-option-text"
                        dangerouslySetInnerHTML={{ __html: stripPrefix(a.content) }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ==========================================
  // RENDER MAIN LAYOUT
  // ==========================================
  return (
    <div className="iig-dual-scroll-wrapper">
      {/* Trình phát Audio ẩn */}
      {audioUrl && (
        <div style={{ display: 'none' }}>
          <audio ref={audioRef} src={audioUrl} controls autoPlay onEnded={handleAudioEnded} />
        </div>
      )}

      {LeftPanel}
      {RightPanel}
    </div>
  );
};

export default ListeningGroupQuestion;