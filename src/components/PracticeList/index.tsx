import React from 'react';
import './PracticeList.scss';
import type { CategoryDto } from '../../pages/Admin/Categories/category.config';

interface PracticeItem {
  id: string | number;
  title: string;
  subtitle?: string;
  correctRate?: number;
  questionCount: number;
  participants: number;
  isFree?: boolean;
  hasExplanation?: boolean;
  status?: 'not-started' | 'in-progress' | 'completed';
  difficulty?: 'easy' | 'medium' | 'hard';
  timeEstimate?: string;
  partId?: string;
}

interface PracticeListProps {
  activePart: CategoryDto | null;
  activeSkill: CategoryDto | null;
  tests: PracticeItem[];
  loading?: boolean;
  onStartTest?: (id: string | number) => void;
  onViewExplanation?: (id: string | number) => void;
}

const PracticeList: React.FC<PracticeListProps> = ({
  activePart,
  activeSkill,
  tests = [],
  loading = false,
  onStartTest,
  onViewExplanation,
}) => {
  if (loading) {
    return (
      <div className="practice-list">
        <div className="practice-list-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải bài luyện tập...</p>
          </div>
        </div>
      </div>
    );
  }

  // Return early if no active part or skill
  if (!activePart || !activeSkill) {
    return (
      <div className="practice-list">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3>Chọn kỹ năng và phần để bắt đầu</h3>
          <p>Vui lòng chọn kỹ năng và phần luyện tập để xem danh sách bài tập</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Trung bình';
    }
  };

  return (
    <div className="practice-list">
      {/* Hero Header */}
      <div className="practice-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>{activeSkill.name}</span>
          </div>
          <h1 className="hero-title">{activePart.name}</h1>
          {activePart.description && (
            <p className="hero-description">{activePart.description}</p>
          )}
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{tests.length}</span>
              <span className="stat-label">Bài luyện tập</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">0%</span>
              <span className="stat-label">Hoàn thành</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Điểm cao nhất</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Cards */}
      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3>Chưa có bài luyện tập</h3>
          <p>Hiện chưa có bài luyện tập nào cho {activePart.name}.</p>
        </div>
      ) : (
        <div className="practice-cards">
          {tests.map((test, index) => (
            <div 
              key={test.id} 
              className="practice-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="card-title-section">
                  <h3 className="card-title">{test.title}</h3>
                  {test.subtitle && (
                    <p className="card-subtitle">{test.subtitle}</p>
                  )}
                </div>
                
                <div className="card-badges">
                  {test.isFree !== false && (
                    <span className="badge badge-free">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Free
                    </span>
                  )}
                  
                  <span 
                    className="badge badge-difficulty"
                    style={{ 
                      background: `${getDifficultyColor(test.difficulty)}15`,
                      color: getDifficultyColor(test.difficulty)
                    }}
                  >
                    {getDifficultyLabel(test.difficulty)}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              {test.correctRate !== undefined && test.correctRate > 0 && (
                <div className="card-progress">
                  <div className="progress-info">
                    <span className="progress-label">Độ chính xác</span>
                    <span className="progress-percentage">{test.correctRate}%</span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ width: `${test.correctRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="card-stats">
                <div className="stat-box">
                  <div className="stat-box-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-box-content">
                    <span className="stat-box-value">{test.questionCount}</span>
                    <span className="stat-box-label">Câu hỏi</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-box-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="stat-box-content">
                    <span className="stat-box-value">{formatNumber(test.participants)}</span>
                    <span className="stat-box-label">Người làm</span>
                  </div>
                </div>

                {test.timeEstimate && (
                  <div className="stat-box">
                    <div className="stat-box-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-box-content">
                      <span className="stat-box-value">{test.timeEstimate}</span>
                      <span className="stat-box-label">Thời gian</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => onStartTest?.(test.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Bắt đầu luyện tập</span>
                </button>

                {test.hasExplanation && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onViewExplanation?.(test.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Xem giải thích</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticeList;