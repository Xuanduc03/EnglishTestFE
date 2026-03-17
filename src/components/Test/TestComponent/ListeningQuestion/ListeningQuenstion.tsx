import React from 'react';
import type { ListeningQuestion as ListeningQuestionType } from '../../../../types/test';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import './ListeningQuestion.scss';

interface ListeningQuestionProps {
  question: ListeningQuestionType;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  onAudioEnd: () => void;
  globalQuestionIndex?: number;
  currentQuestion?: number;
}

const LABELS = ['A', 'B', 'C', 'D'];

const ListeningQuestion: React.FC<ListeningQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
  onAudioEnd,
  globalQuestionIndex = 1,
  currentQuestion = 1,
}) => {
  const isBlindMode = !!question.image;

  return (
    <div className="iig-question-wrapper">
      {/* 1. Trình phát Audio: Đưa vào một góc nhỏ hoặc ẩn hẳn đi */}
      {/* Nếu hệ thống của bạn tự động play, bạn có thể style cho class .hidden-audio */}
      <div className="iig-audio-mini-container">
        <AudioPlayer audioUrl={question.audio} onAudioEnd={onAudioEnd} />
      </div>

      <div className="iig-columns-layout">

        {/* --- CỘT TRÁI: Hướng dẫn và Hình ảnh --- */}
        <div className="iig-column iig-column-left">
          <div className="iig-instruction">
            Select the one statement that best describes what you see in the picture.
          </div>

          {question.image && (
            <div className="iig-image-wrapper">
              <img src={question.image} alt="Question visual" />
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: Câu hỏi và Checkbox Đáp án --- */}
        <div className="iig-column iig-column-right">
          <div className="iig-question-label">Question</div>

          {/* Tiêu đề câu hỏi */}
          <div className="iig-question-text">
            {question.question ? (
              <span dangerouslySetInnerHTML={{ __html: question.question }} />
            ) : (
              <span>Question {currentQuestion}</span>
            )}
          </div>

          <div className="iig-options-container">
            {question.options.map((opt: string, idx: number) => {
              const isSelected = selectedAnswer === idx;

              return (
                <label key={idx} className={`iig-option-row ${isSelected ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={isSelected}
                    onChange={() => onAnswer(idx)}
                    className="iig-radio-input"
                  />
                  <span className="iig-option-letter">({LABELS[idx]})</span>

                  {/* Chỉ hiện nội dung đáp án nếu KHÔNG có ảnh (Part 2) */}
                  {!isBlindMode && opt && (
                    <span
                      className="iig-option-text"
                      dangerouslySetInnerHTML={{ __html: opt }}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ListeningQuestion;