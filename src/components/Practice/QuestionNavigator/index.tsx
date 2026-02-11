import React from 'react';
import { FlagFilled, CheckCircleFilled } from '@ant-design/icons';
import './QuestionNavigator.scss';
import type { PracticeSessionDto } from '../Types/practice.type';

interface QuestionNavigatorProps {
  session: PracticeSessionDto;
  currentIndex: number;
  answers: Map<string, string>;
  markedForReview: Set<string>;
  onNavigate: (index: number) => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  session,
  currentIndex,
  answers,
  markedForReview,
  onNavigate
}) => {
  // Build flat list of questions with metadata
  const questionList = (() => {
    const list: Array<{
      index: number;
      questionId: string;
      questionNumber: number;
      partName: string;
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
          partNumber: part.partNumber
        });
        globalIndex++;
        globalQuestionNumber++;
      });
    });

    return list;
  })();

  // Group by parts for display
  const questionsByPart = (() => {
    const grouped: Record<string, typeof questionList> = {};
    
    questionList.forEach(q => {
      if (!grouped[q.partName]) {
        grouped[q.partName] = [];
      }
      grouped[q.partName].push(q);
    });

    return grouped;
  })();

  // Get question status
  const getQuestionStatus = (questionId: string) => {
    const isAnswered = answers.has(questionId);
    const isMarked = markedForReview.has(questionId);

    return { isAnswered, isMarked };
  };

  // Calculate stats
  const stats = {
    total: questionList.length,
    answered: Array.from(answers.keys()).length,
    marked: markedForReview.size
  };

  return (
    <div className="question-navigator">
      <div className="navigator-header">
        <h3>Câu hỏi</h3>
        <div className="stats">
          <div className="stat">
            <CheckCircleFilled style={{ color: '#52c41a' }} />
            <span>{stats.answered}/{stats.total}</span>
          </div>
          {stats.marked > 0 && (
            <div className="stat">
              <FlagFilled style={{ color: '#faad14' }} />
              <span>{stats.marked}</span>
            </div>
          )}
        </div>
      </div>

      <div className="navigator-content">
        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <span className="dot answered"></span>
            <span>Đã trả lời</span>
          </div>
          <div className="legend-item">
            <span className="dot current"></span>
            <span>Đang làm</span>
          </div>
          <div className="legend-item">
            <span className="dot unanswered"></span>
            <span>Chưa làm</span>
          </div>
          <div className="legend-item">
            <FlagFilled style={{ color: '#faad14', fontSize: 12 }} />
            <span>Đánh dấu</span>
          </div>
        </div>

        {/* Questions grouped by part */}
        {session.parts.map(part => {
          const partQuestions = questionsByPart[part.partName] || [];
          
          return (
            <div key={part.partId} className="part-section">
              <div className="part-header">
                <span className="part-name">{part.partName}</span>
                <span className="part-count">({partQuestions.length})</span>
              </div>

              <div className="question-grid">
                {partQuestions.map(q => {
                  const { isAnswered, isMarked } = getQuestionStatus(q.questionId);
                  const isCurrent = q.index === currentIndex;

                  return (
                    <button
                      key={q.index}
                      className={`
                        question-btn
                        ${isCurrent ? 'current' : ''}
                        ${isAnswered ? 'answered' : 'unanswered'}
                      `}
                      onClick={() => onNavigate(q.index)}
                    >
                      <span className="question-num">{q.questionNumber}</span>
                      {isMarked && (
                        <FlagFilled className="flag-icon" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator;