import React from 'react';
import { type Answer } from '../../../../types/test';
import { TOTAL_QUESTIONS } from '../../../../constants/test';
import { getPartTooltip } from '../../../../utils/testHelper';
import './QuestionNav.scss';

interface QuestionNavProps {
  currentQuestion: number;
  answers: Answer[];
  onNavigate: (id: number) => void;
  onPrev: () => void;
  onNext: () => void;
  marked: boolean;
  onMarkToggle: () => void;
  onClose?: () => void;
}

const QuestionNav: React.FC<QuestionNavProps> = ({
  currentQuestion,
  answers,
  onNavigate,
  onPrev,
  onNext,
  marked,
  onMarkToggle,
  onClose,
}) => {
  // Tính toán số câu đã làm và phần trăm hoàn thành
  const answeredCount = answers.filter(answer => answer.answer !== null).length;
  const progressPercentage = (answeredCount / TOTAL_QUESTIONS) * 100;

  // Nhóm câu hỏi theo part với thông tin chi tiết
  const partGroups = [
    { 
      name: 'Part 1', 
      range: [1, 6], 
      color: '#ef4444',
      description: 'Photographs',
      icon: '🖼️'
    },
    { 
      name: 'Part 2', 
      range: [7, 31], 
      color: '#f59e0b',
      description: 'Question-Response',
      icon: '🎤'
    },
    { 
      name: 'Part 3', 
      range: [32, 70], 
      color: '#10b981',
      description: 'Conversations',
      icon: '💬'
    },
    { 
      name: 'Part 4', 
      range: [71, 100], 
      color: '#3b82f6',
      description: 'Short Talks',
      icon: '📢'
    },
    { 
      name: 'Part 5', 
      range: [101, 130], 
      color: '#8b5cf6',
      description: 'Incomplete Sentences',
      icon: '📝'
    },
    { 
      name: 'Part 6', 
      range: [131, 146], 
      color: '#ec4899',
      description: 'Text Completion',
      icon: '📄'
    },
    { 
      name: 'Part 7', 
      range: [147, 200], 
      color: '#06b6d4',
      description: 'Reading Comprehension',
      icon: '📖'
    },
  ];

  // Lấy thông tin part hiện tại
  const currentPart = partGroups.find(p => 
    currentQuestion >= p.range[0] && currentQuestion <= p.range[1]
  );

  return (
    <div className="question-nav">
      {/* Header với thông tin tổng quan */}
      <div className="nav-header">
        <div className="header-top">
          <h3 className="nav-title">
            <span className="nav-icon">📋</span>
            Danh Sách Câu Hỏi
          </h3>
          {onClose && (
            <button className="close-btn" onClick={onClose} title="Đóng">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="progress-overview">
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{answeredCount}</span>
              <span className="stat-label">Đã làm</span>
            </div>
            <div className="stat">
              <span className="stat-value">{TOTAL_QUESTIONS - answeredCount}</span>
              <span className="stat-label">Chưa làm</span>
            </div>
            <div className="stat">
              <span className="stat-value">{answers.filter(a => a.marked).length}</span>
              <span className="stat-label">Đánh dấu</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Navigation - Chuyển nhanh giữa các Part */}
      <div className="quick-nav-section">
        <h4 className="section-title">
          <span className="section-icon">⚡</span>
          Chuyển Nhanh
        </h4>
        <div className="part-grid">
          {partGroups.map(part => {
            const partAnswered = answers.slice(part.range[0], part.range[1] + 1)
              .filter(a => a.answer !== null).length;
            const partTotal = part.range[1] - part.range[0] + 1;
            const isCurrentPart = currentQuestion >= part.range[0] && currentQuestion <= part.range[1];

            return (
              <button
                key={part.name}
                className={`part-card ${isCurrentPart ? 'current' : ''}`}
                onClick={() => onNavigate(part.range[0])}
                style={{ '--part-color': part.color } as React.CSSProperties}
              >
                <div className="part-header">
                  <span className="part-icon">{part.icon}</span>
                  <span className="part-name">{part.name}</span>
                </div>
                <div className="part-description">{part.description}</div>
                <div className="part-progress">
                  <div className="part-progress-bar">
                    <div 
                      className="part-progress-fill" 
                      style={{ width: `${(partAnswered / partTotal) * 100}%` }}
                    ></div>
                  </div>
                  <span className="part-count">{partAnswered}/{partTotal}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách chi tiết câu hỏi */}
      <div className="questions-section">
        <div className="section-header">
          <h4 className="section-title">
            <span className="section-icon">📝</span>
            Tất Cả Câu Hỏi
            {currentPart && (
              <span className="current-part-badge" style={{ backgroundColor: currentPart.color }}>
                {currentPart.name}
              </span>
            )}
          </h4>
          <div className="view-controls">
            <span className="view-label">Hiển thị:</span>
            <button className="view-btn active">Tất cả</button>
            <button className="view-btn">Chưa làm</button>
            <button className="view-btn">Đánh dấu</button>
          </div>
        </div>

        <div className="questions-grid">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map(id => {
            const isAnswered = answers[id].answer !== null;
            const isMarked = answers[id].marked;
            const isCurrent = id === currentQuestion;
            const partInfo = partGroups.find(p => id >= p.range[0] && id <= p.range[1]);

            return (
              <button
                key={id}
                className={`question-btn ${isCurrent ? 'current' : ''} ${
                  isAnswered ? 'answered' : ''
                } ${isMarked ? 'marked' : ''}`}
                onClick={() => onNavigate(id)}
                style={{ 
                  '--part-color': partInfo?.color 
                } as React.CSSProperties}
                title={`${getPartTooltip(id)} - Câu ${id}${
                  isAnswered ? ' (Đã làm)' : ' (Chưa làm)'
                }${isMarked ? ' - Đã đánh dấu' : ''}`}
              >
                <span className="question-number">{id}</span>
                <div className="question-status">
                  {isMarked && <span className="status-icon marked-icon" title="Đã đánh dấu">📍</span>}
                  {isAnswered && !isMarked && (
                    <span className="status-icon answered-icon" title="Đã làm">✓</span>
                  )}
                  {!isAnswered && !isMarked && (
                    <span className="status-icon not-answered-icon" title="Chưa làm">○</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="nav-controls">
        <button className="control-btn prev-btn" onClick={onPrev}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span>Câu trước</span>
        </button>
        
        <div className="control-center">
          <div className="current-question-display">
            <span className="current-label">Đang xem:</span>
            <span className="current-number">Câu {currentQuestion}</span>
          </div>
          <button 
            className={`mark-toggle-btn ${marked ? 'active' : ''}`}
            onClick={onMarkToggle}
          >
            <span className="mark-icon">{marked ? '📍' : '📌'}</span>
            <span>{marked ? 'Bỏ đánh dấu' : 'Đánh dấu'}</span>
          </button>
        </div>
        
        <button className="control-btn next-btn" onClick={onNext}>
          <span>Câu sau</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="nav-legend">
        <div className="legend-item">
          <div className="legend-dot current-dot"></div>
          <span>Hiện tại</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot answered-dot"></div>
          <span>Đã làm</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot marked-dot"></div>
          <span>Đánh dấu</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot"></div>
          <span>Chưa làm</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNav;