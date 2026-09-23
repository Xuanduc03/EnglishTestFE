import React, { useState } from 'react';
import { FlagFilled, MenuOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import './QuestionNavigator.scss';
import type { PracticeSessionDto } from '../Types/practice.type';

interface QuestionNavigatorProps {
  session: PracticeSessionDto;
  currentIndex: number;
  answers: Map<string, string>;
  markedForReview: Set<string>;
  onNavigate: (index: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  onMarkReview: () => void;
  isMarked: boolean;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  session,
  currentIndex,
  answers,
  markedForReview,
  onNavigate,
  onPrevPage,
  onNextPage,
  isFirstPage,
  isLastPage,
  onMarkReview,
  isMarked
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const questionList = (() => {
    const list: Array<{
      index: number;
      questionId: string;
      questionNumber: number;
      partName: string;
      partId: string;
      partNumber: number;
    }> = [];
    let globalIndex = 0;
    let globalQuestionNumber = 1;
    session.parts.forEach(part => {
      part.questions.forEach(question => {
        list.push({
          index: globalIndex,
          questionId: question.questionId,
          questionNumber: globalQuestionNumber,
          partName: part.partName,
          partId: part.partId,
          partNumber: part.partNumber
        });
        globalIndex++;
        globalQuestionNumber++;
      });
    });
    return list;
  })();

  const getQuestionStatus = (questionId: string) => {
    const isAnswered = answers.has(questionId);
    const isMarked = markedForReview.has(questionId);
    return { isAnswered, isMarked };
  };

  const total = questionList.length;
  const answered = answers.size;
  const unanswered = total - answered;
  const marked = markedForReview.size;

  return (
    <div className={`question-navigator ${isOpen ? 'open' : 'closed'}`}>
      <div className="navigator-header">
        <div className="nav-controls">
          <button className="nav-btn prev" onClick={onPrevPage} disabled={isFirstPage}>
            <LeftOutlined /> Previous
          </button>
          
          <button className={`nav-btn mark ${isMarked ? 'active' : ''}`} onClick={onMarkReview}>
            <FlagFilled /> {isMarked ? 'Unmark' : 'Mark'}
          </button>

          <button className="nav-btn next" onClick={onNextPage} disabled={isLastPage}>
            Next <RightOutlined />
          </button>
        </div>

        <div className="header-actions">
          <span className="title">Question {currentIndex + 1}/{total}</span>
          <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)} title="Toggle question list">
            <MenuOutlined />
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Answered</span>
              <span className="stat-value answered">{answered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unanswered</span>
              <span className="stat-value">{unanswered}</span>
            </div>
            {marked > 0 && (
              <div className="stat-item">
                <span className="stat-label">Marked</span>
                <span className="stat-value marked">{marked}</span>
              </div>
            )}
          </div>

          <div className="question-grid">
            {questionList.map(q => {
              const { isAnswered, isMarked } = getQuestionStatus(q.questionId);
              const isCurrent = q.index === currentIndex;
              return (
                <button
                  key={q.index}
                  className={`question-btn 
                    ${isCurrent ? 'current' : ''} 
                    ${isAnswered ? 'answered' : 'unanswered'}
                    ${isMarked ? 'marked' : ''}`}
                  onClick={() => onNavigate(q.index)}
                  title={`Question ${q.questionNumber}${isMarked ? ' (Marked)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                >
                  <span className="question-num">{q.questionNumber}</span>
                  {isMarked && <FlagFilled className="flag-icon" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionNavigator;