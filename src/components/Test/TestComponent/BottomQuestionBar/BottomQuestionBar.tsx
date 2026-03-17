import React, { useState, useEffect } from 'react';
import type { Answer } from '../../../../types/test';
import type { ExamSectionPreview } from '../../../../pages/Student/FullTest/examAttempt.types';
import { 
  UnorderedListOutlined,
  LeftOutlined, 
  RightOutlined 
} from '@ant-design/icons';
import './BottomQuestionBar.scss';

interface BottomQuestionBarProps {
  currentQuestion: number;
  answers: Answer[];
  onNavigate: (id: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  marked?: boolean;
  onMarkToggle?: () => void;
  totalQuestions?: number;
  sections?: ExamSectionPreview[];
  isListening?: boolean;
  onSubmit?: () => void; // Thêm prop này để gọi nộp bài
}

const buildPartGroups = (sections: ExamSectionPreview[]) => {
  let globalIdx = 1;
  return sections.map(s => {
    const count = s.questions.length;
    const start = globalIdx;
    const end = globalIdx + count - 1;
    globalIdx += count;
    return {
      sectionId: s.sectionId,
      name: s.sectionName,
      range: [start, end] as [number, number],
    };
  });
};

const BottomQuestionBar: React.FC<BottomQuestionBarProps> = ({
  currentQuestion,
  answers,
  onNavigate,
  onPrev,
  onNext,
  marked = false,
  onMarkToggle,
  totalQuestions = 200,
  sections = [],
  isListening = false,
  onSubmit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // if (isListening) return null;

  const partGroups = buildPartGroups(sections);

  // Đếm số câu chưa làm để hiển thị câu cảnh báo cho chuẩn
  const unansweredCount = answers.slice(1, totalQuestions + 1).filter(a => a.answer === null || a.answer === undefined).length;

  return (
    <>
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="iig-review-modal-overlay">
          <div className="iig-review-modal">
            
            <h2 className="modal-title">NOTIFICATION</h2>
            <p className="modal-subtitle">
              {unansweredCount > 0 
                ? "You have unanswered questions. Submit anyway?" 
                : "Are you sure you want to finish the test?"}
            </p>

            <div className="modal-content-box">
              <div className="section-header">Reading</div>
              
              <div className="timeline-container">
                {partGroups.map(part => {
                  const allIds = Array.from(
                    { length: Math.min(part.range[1], totalQuestions) - part.range[0] + 1 },
                    (_, i) => part.range[0] + i
                  );

                  if (allIds.length === 0) return null;

                  return (
                    <div key={part.sectionId} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="part-title">{part.name}</div>
                      
                      <div className="grid-container">
                        {allIds.map(id => {
                          const isAnswered = answers[id]?.answer !== null && answers[id]?.answer !== undefined;
                          
                          return (
                            <button
                              key={id}
                              className={`grid-btn ${isAnswered ? 'answered' : 'unanswered'}`}
                              onClick={() => {
                                onNavigate(id);
                                setIsModalOpen(false);
                              }}
                              title={`Go to Question ${id}`}
                            >
                              {id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-review" onClick={() => setIsModalOpen(false)}>
                Review
              </button>
              <button className="btn-finish" onClick={() => {
                setIsModalOpen(false);
                onSubmit && onSubmit();
              }}>
                Finish test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY (READING)                         */}
      {/* ========================================================= */}
      <div className="iig-bottom-bar">
        <div className="bar-left">
          <label className="iig-mark-checkbox">
            <input 
              type="checkbox" 
              checked={marked} 
              onChange={onMarkToggle} 
            />
            <span>Mark item for review</span>
          </label>
        </div>

        <div className="bar-right">
          <button 
            className="iig-action-btn btn-list" 
            onClick={() => setIsModalOpen(true)}
            title="Review / Submit"
          >
            <UnorderedListOutlined />
          </button>
          
          <button 
            className="iig-action-btn btn-nav btn-prev" 
            onClick={onPrev}
            disabled={!onPrev}
          >
            <LeftOutlined />
          </button>

          <button 
            className="iig-action-btn btn-nav btn-next" 
            onClick={onNext}
            disabled={!onNext}
          >
            <RightOutlined />
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomQuestionBar;