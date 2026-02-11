import React from 'react';
import Timer from '../Timer/Timer';
import './Header.scss';

interface HeaderProps {
  timeLeft: number;
  onSubmit: () => void;
  progressPercentage?: number;
  answeredCount?: number;
  totalQuestions?: number;
}

const Header: React.FC<HeaderProps> = ({ timeLeft, onSubmit,  progressPercentage = 0,
  answeredCount = 0,
  totalQuestions = 200  }) => {
  return (
    <header className="test-header">
      <div className="header-content">
        <div className="header-left">
          <svg 
            className="header-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
          </svg>
          <h1 className="header-title">Bài Thi Thử TOEIC Full Test</h1>
        </div>
        <div className="header-right">
          <Timer timeLeft={timeLeft} />
          <button className="submit-btn" onClick={onSubmit}>
            Nộp bài
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;