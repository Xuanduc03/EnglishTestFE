import React from 'react';
import type { Answer } from '../../../../types/test';
import type { ExamQuestionPreview } from '../../../../pages/Student/FullTest/examAttempt.types';
import './ReadingBlockQuestion.scss';

interface ReadingGroupQuestionProps {
  groupQuestions: ExamQuestionPreview[];
  currentQuestion: number;
  answers: Answer[];
  onAnswer: (questionId: number, answerIndex: number) => void;
  globalStartIndex: number;
}

const LABELS = ['A', 'B', 'C', 'D'];

// bóc tách các ký tự đáp án trước câu trả lời vd : (A). cbss
const stripPrefix = (text: string) => {
  if (!text) return '';
  return text
    .replace(/(>|^)\s*(\([A-D]\)|[A-D]\.)\s*/i, '$1') 
    .trim();
};

const ReadingGroupQuestion: React.FC<ReadingGroupQuestionProps> = ({
  groupQuestions,
  currentQuestion,
  answers,
  onAnswer,
  globalStartIndex,
}) => {
  const first = groupQuestions[0];
  const groupContent = first.groupContent ?? '';
  const groupImageUrl = first.groupImageUrl ?? null;

  // ==========================================
  // COMPONENT CỘT TRÁI: NGỮ CẢNH (ẢNH/ĐOẠN VĂN)
  // ==========================================
  const LeftPanel = (
    <div className="iig-panel iig-left-panel">
      <div className="iig-instruction">
        Questions {globalStartIndex} - {globalStartIndex + groupQuestions.length - 1} refer to the following text.
      </div>
      
      {groupImageUrl && (
        <div className="iig-image-wrapper">
          <img src={groupImageUrl} alt="Reading passage visual" />
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
              {/* Tiêu đề câu hỏi */}
              <div className="iig-question-text">
                <strong>{globalIdx}. </strong>
                {q.content ? (
                  <span dangerouslySetInnerHTML={{ 
                    __html: q.content.replace(/_{3,}/g, '<span class="iig-fill-blank">_________</span>') 
                  }} />
                ) : (
                  <span>Question {globalIdx}</span>
                )}
              </div>

              {q.imageUrl && <img src={q.imageUrl} alt="Specific" className="iig-specific-img" />}

              {/* Danh sách đáp án */}
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
      {LeftPanel}
      {RightPanel}
    </div>
  );
};

export default ReadingGroupQuestion;