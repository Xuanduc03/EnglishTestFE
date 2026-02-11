import React, { useState } from 'react';
import './QuestionPart1.scss';
import AudioPlayer from './AudioPlayer';
import SidebarPagination from './SidebarPagination';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;


const QuestionPart1 = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 5;

  // Mock data
  const questions = [
    {
      id: 1,
      imageUrl: "/placeholder-image.jpg",
      audioSrc: "/sample-audio.mp3",
      options: ["(A) He's holding a book.", "(B) He's typing on a keyboard.", "(C) He's looking out the window.", "(D) He's talking on the phone."]
    },
    {
      id: 2,
      imageUrl: "/placeholder-image2.jpg",
      audioSrc: "/sample-audio2.mp3",
      options: ["(A) The woman is standing by the desk.", "(B) The chairs are stacked in the corner.", "(C) The papers are organized in files.", "(D) The computer is turned off."]
    },
    // Add more questions...
  ];

  const currentQuestionData = questions.find(q => q.id === currentQuestion) || questions[0];

  return (
    <div className="page">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar__left">
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo">
              <span className="logo-icon">📚</span>
              <div className="logo-text">
                <Title level={4} className="logo-title">TOEIC Master</Title>
                <Text type="secondary" className="logo-subtitle">IELTS & TOEIC Practice</Text>
              </div>
            </div>
          </div>
        </div>

        <div className="topbar__center">
          <div className="timer">
            <span className="timer-icon">⏱️</span> 00:09:27
          </div>
        </div>

        <div className="topbar__right">
          <button className="back-btn">
            <span>←</span> Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <SidebarPagination
            total={totalQuestions}
            current={currentQuestion}
            onSelect={setCurrentQuestion}
          />
        </div>

        {/* Center Content */}
        <div className="content">
          <div className="center-col">
            <div className="question-card">
              {/* Question Header */}
              <div className="question-card__header">
                <div className="question-title">
                  <h3>Câu hỏi {currentQuestion}.</h3>
                </div>
                <div className="audio-timer">
                  <span className="audio-progress">0:00 / 0:22</span>
                </div>
              </div>

              {/* Audio Player */}
              <div className="question-card__audio">
                <AudioPlayer src={currentQuestionData.audioSrc} />
              </div>

              {/* Question Body */}
              <div className="question-card__body">
                {/* Image Section */}
                <div className="image-section">
                  <div className="image-wrap">
                    <img
                      src={currentQuestionData.imageUrl}
                      alt={`Question ${currentQuestion}`}
                      className="question-image"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="options-section">
                  <div className="options-title">Chọn một đáp án:</div>
                  <form className="options-form">
                    {currentQuestionData.options.map((opt, i) => (
                      <label key={i} className="option">
                        <input
                          type="radio"
                          name={`answer-${currentQuestion}`}
                          className="option-input"
                        />
                        <span className="custom-radio"></span>
                        <span className="option-text">{opt}</span>
                      </label>
                    ))}
                  </form>
                </div>

                {/* Additional Info */}
                <div className="additional-info">
                  <div className="info-title">Ký hiệu nhất thẩm:</div>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="info-check">✓</span>
                      <span className="info-text">Nhực học TRIBIC phương tiện</span>
                    </div>
                    <div className="info-item">
                      <span className="info-check">✓</span>
                      <span className="info-text">Họ tư</span>
                    </div>
                    <div className="info-item">
                      <span className="info-check">✓</span>
                      <span className="info-text">Hàng số ngoại</span>
                    </div>
                    <div className="info-item">
                      <span className="info-check">✓</span>
                      <span className="info-text">Nhực học kế phạm mềm</span>
                    </div>
                    <div className="info-item">
                      <span className="info-check">✓</span>
                      <span className="info-text">Lương tận BTT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPart1;