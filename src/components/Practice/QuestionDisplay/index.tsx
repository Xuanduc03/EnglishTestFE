import React from 'react';
import { Radio, Space, Card } from 'antd';
import { AudioOutlined, PictureOutlined } from '@ant-design/icons';
import './QuestionDisplay.scss';
import type { PracticeQuestionDto } from '../Types/practice.type';

interface QuestionDisplayProps {
  question: PracticeQuestionDto;
  questionNumber: number;
  selectedAnswerId?: string;
  isMarkedForReview: boolean;
  onSelectAnswer: (answerId: string) => void;
  onMarkForReview: () => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  selectedAnswerId,
  onSelectAnswer
}) => {
  // ============================================
  // RENDER GROUP CONTENT (Part 3,4,6,7)
  // ============================================

  const renderGroupContent = () => {
    if (!question.groupId) return null;

    // Part 7 Multiple Passages
    if (question.passages && question.passages.length > 0) {
      return (
        <div className="group-content passages">
          {question.passages.map((passage, index) => (
            <Card
              key={passage.id}
              className="passage-card"
              title={passage.title || `Passage ${index + 1}`}
              size="small"
            >
              <div 
                className="passage-content"
                dangerouslySetInnerHTML={{ __html: passage.content }}
              />
            </Card>
          ))}
        </div>
      );
    }

    // Part 3,4 - Audio
    if (question.groupMedia && question.groupMedia.length > 0) {
      return (
        <div className="group-content audio">
          {question.groupMedia.map(media => (
            <div key={media.id} className="audio-player">
              <AudioOutlined className="audio-icon" />
              <audio controls src={media.url}>
                Your browser does not support the audio element.
              </audio>
              {question.groupContent && (
                <details className="transcript">
                  <summary>Xem transcript</summary>
                  <p>{question.groupContent}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Part 6 - Text passage
    if (question.groupContent) {
      return (
        <div className="group-content passage">
          <Card className="passage-card" size="small">
            <div 
              className="passage-content"
              dangerouslySetInnerHTML={{ __html: question.groupContent }}
            />
          </Card>
        </div>
      );
    }

    return null;
  };

  // ============================================
  // RENDER QUESTION MEDIA (Part 1,2)
  // ============================================

  const renderQuestionMedia = () => {
    if (!question.media || question.media.length === 0) return null;

    return (
      <div className="question-media">
        {question.media.map(media => {
          if (media.type === 'image') {
            return (
              <div key={media.id} className="media-image">
                <img src={media.url} alt={media.description || 'Question image'} />
              </div>
            );
          }

          if (media.type === 'audio') {
            return (
              <div key={media.id} className="media-audio">
                <AudioOutlined className="audio-icon" />
                <audio controls src={media.url}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // ============================================
  // RENDER GROUP INFO
  // ============================================

  const renderGroupInfo = () => {
    if (!question.groupId || !question.totalQuestionsInGroup) return null;

    return (
      <div className="group-info">
        <span className="group-badge">
          Question {question.questionIndexInGroup} of {question.totalQuestionsInGroup}
        </span>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="question-display">
      {/* Question Number */}
      <div className="question-header">
        <h3 className="question-number">
          Question {questionNumber}
          {question.groupId && ` (${question.questionIndexInGroup}/${question.totalQuestionsInGroup})`}
        </h3>
        {renderGroupInfo()}
      </div>

      {/* Group Content (Passage/Audio) */}
      {renderGroupContent()}

      {/* Question Content */}
      <div className="question-content">
        {/* Question Media (Image/Audio for Part 1,2) */}
        {renderQuestionMedia()}

        {/* Question Text */}
        <div 
          className="question-text"
          dangerouslySetInnerHTML={{ __html: question.content }}
        />

        {/* Answer Options */}
        <div className="answer-options">
          <Radio.Group
            value={selectedAnswerId}
            onChange={(e) => onSelectAnswer(e.target.value)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.answers
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(answer => (
                  <Radio
                    key={answer.id}
                    value={answer.id}
                    className="answer-option"
                  >
                    <div className="answer-content">
                      <span className="answer-label">{answer.answerLabel}.</span>
                      
                      {/* Answer with audio (Part 2) */}
                      {answer.media && answer.media.length > 0 ? (
                        <div className="answer-media">
                          {answer.media.map(media => (
                            <audio key={media.id} controls src={media.url}>
                              Your browser does not support the audio element.
                            </audio>
                          ))}
                          <span className="answer-text">{answer.content}</span>
                        </div>
                      ) : (
                        <span className="answer-text">{answer.content}</span>
                      )}
                    </div>
                  </Radio>
                ))}
            </Space>
          </Radio.Group>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;