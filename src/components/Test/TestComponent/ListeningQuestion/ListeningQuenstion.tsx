import React from 'react';
import type { ListeningQuestion as ListeningQuestionType } from '../../../../types/test';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import './ListeningQuestion.scss';

interface ListeningQuestionProps {
  question: ListeningQuestionType;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  onAudioEnd: () => void;
}

const ListeningQuestion: React.FC<ListeningQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
  onAudioEnd,
}) => {
  return (
    <div className="listening-question-container">
      {/* Audio Player - Auto-plays, no replay */}
      <AudioPlayer
        audioUrl={question.audio}
        onAudioEnd={onAudioEnd}
        autoPlay={true}
      />

      {/* Instruction */}
      <div className="listening-instruction">
        <p className="instruction-text">
          ⚠️ <strong>Lưu ý:</strong> Audio chỉ phát một lần. Câu hỏi sẽ tự động chuyển khi audio kết thúc.
        </p>
      </div>

      {/* Layout chia 2 cột chính */}
      <div className="two-column-layout">
        {/* Cột trái: Instruction + Content (Image/Table) */}
        <div className="left-content-panel">
          <p className="instruction-text">
            Select the best response to each question.
          </p>

          {question.image && (
            <div className="content-area">
              <img
                src={question.image}
                alt="Question content"
                className="question-content-image"
              />
            </div>
          )}
        </div>

        {/* Cột phải: Question Panel */}
        <div className="right-question-panel">
          <h3 className="question-header">Question</h3>

          {/* Options */}
          <div className="options-list">
            {question.options.map((opt: string, idx: number) => (
              <label
                key={idx}
                className={`option-item ${selectedAnswer === idx ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`q${question.id}`}
                  value={idx}
                  checked={selectedAnswer === idx}
                  onChange={() => onAnswer(idx)}
                  className="radio-input"
                />
                <span className="option-content">
                  <strong>({String.fromCharCode(65 + idx)})</strong> {opt}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningQuestion;