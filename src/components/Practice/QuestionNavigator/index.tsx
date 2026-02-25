import React, { useState } from 'react';
import { FlagFilled, MenuOutlined, RedoOutlined } from '@ant-design/icons';
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
  const [isOpen, setIsOpen] = useState(true);

  // Build flat list of questions with metadata
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

  // Get question status
  const getQuestionStatus = (questionId: string) => {
    const isAnswered = answers.has(questionId);
    const isMarked = markedForReview.has(questionId);
    return { isAnswered, isMarked };
  };

  // Calculate stats
  const total = questionList.length;
  const answered = answers.size;
  const unanswered = total - answered;
  const marked = markedForReview.size;

  const handleRestart = () => {
    // TODO: implement restart logic later
    console.log('Restart clicked');
  };

  return (
    <div className={`question-navigator ${isOpen ? 'open' : 'closed'}`}>
      <div className="navigator-header">
        <span className="title">Câu hỏi 1-{total}</span>
        <div className="header-actions">
          <button className="restart-btn" onClick={handleRestart}>
            <RedoOutlined /> Restart
          </button>
          <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            <MenuOutlined />
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="stats">
            <div className="stat correct">
              <span className="stat-value">{answered}</span> Đúng
              <span className="stat-total">/{total}</span>
            </div>
            <div className="stat incorrect">
              <span className="stat-value">0</span> Sai
              <span className="stat-total">/{total}</span>
            </div>
            <div className="stat unanswered">
              <span className="stat-value">{unanswered}</span> Chưa trả lời
              <span className="stat-total">/{total}</span>
            </div>
          </div>

          <div className="question-row">
            {questionList.map(q => {
              const { isAnswered, isMarked } = getQuestionStatus(q.questionId);
              const isCurrent = q.index === currentIndex;

              return (
                <button
                  key={q.index}
                  className={`
                    question-btn
                    ${isCurrent ? 'current' : ''}
                    ${isAnswered ? 'answered' : 'unanswered'}
                    ${isMarked ? 'marked' : ''}
                  `}
                  onClick={() => onNavigate(q.index)}
                  title={`Câu ${q.questionNumber}${isMarked ? ' (Đánh dấu)' : ''}${isAnswered ? ' (Đã trả lời)' : ''}`}
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