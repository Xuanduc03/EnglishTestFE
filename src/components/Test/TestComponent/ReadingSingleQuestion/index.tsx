import React from 'react';
import './ReadingSingleQuestion.scss';

interface ReadingSingleQuestionProps {
  question: {
    id: number;
    question: string;
    options: string[];
    part?: number;
  };
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

// Hàm để xóa các ký tự (A), A. bị dính trong data API
const stripPrefix = (text: string) => {
  if (!text) return '';
  return text
    .replace(/(>|^)\s*(\([A-D]\)|[A-D]\.)\s*/i, '$1') 
    .trim();
};  

const ReadingSingleQuestion: React.FC<ReadingSingleQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  // Thay thế dấu gạch dưới bằng span để style chỗ trống
  const formattedQuestion = question.question.replace(
    /_{3,}/g,
    '<span class="iig-fill-blank">_________</span>'
  );

  return (
    <div className="iig-reading-single-wrapper">
      <div className="iig-column iig-single-column">
        
        {/* Hướng dẫn làm bài chuẩn IIG */}
        <div className="iig-instruction">
          Select the best answer to complete the sentence.
        </div>

        <div className="iig-question-label">Question</div>
        
        <div className="iig-question-block">
          
          {/* Phần câu hỏi */}
          <div className="iig-question-text">
            {/* Nếu data truyền vào chưa có số câu, có thể thêm {question.id}. ở trước */}
            <span dangerouslySetInnerHTML={{ __html: formattedQuestion }} />
          </div>

          {/* Phần đáp án (Các thẻ dính liền nhau) */}
          <div className="iig-options-container">
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const letter = LABELS[idx];

              return (
                <label key={idx} className="iig-option-row">
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={isSelected}
                    onChange={() => onAnswer(idx)}
                    className="iig-radio-input"
                  />
                  <span className="iig-option-letter">({letter})</span>
                  <span
                    className="iig-option-text"
                    dangerouslySetInnerHTML={{ __html: stripPrefix(opt) }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingSingleQuestion;