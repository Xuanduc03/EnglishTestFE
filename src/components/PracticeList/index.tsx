import React from 'react';
import './PracticeList.scss';
import type { CategoryDto } from '../../pages/Admin/Categories/category.config';

export interface PracticeItem {
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
  sessionId?: string;
}

interface PracticeListProps {
  activeSkill?: CategoryDto | null;
  tests: PracticeItem[];
  loading?: boolean;
  onStartTest?: (id: string | number) => void;
  onContinueTest?: (sessionId: string) => void;
  onViewResult?: (sessionId: string) => void;
  emptyMessage?: string;
}

const PracticeList: React.FC<PracticeListProps> = ({
  activeSkill,
  tests = [],
  loading = false,
  onStartTest,
  onContinueTest,
  onViewResult,
  emptyMessage = "Hiện chưa có bài luyện tập nào."
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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'in-progress': return 'Đang làm dở';
      case 'completed': return 'Đã hoàn thành';
      default: return '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in-progress': return '#1890ff';
      case 'completed': return '#52c41a';
      default: return 'transparent';
    }
  };

  return (
    <div className="practice-list">
      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3>Chưa có bài luyện tập</h3>
          <p>{activeSkill ? `Chưa có bài luyện tập cho ${activeSkill.name}.` : emptyMessage}</p>
        </div>
      ) : (
        <div className="practice-cards">
          {tests.map((test, index) => (
            <div
              key={test.sessionId || test.id}
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
                  {test.status && test.status !== 'not-started' && (
                    <span
                      className="badge"
                      style={{
                        background: `${getStatusColor(test.status)}15`,
                        color: getStatusColor(test.status),
                        border: `1px solid ${getStatusColor(test.status)}40`
                      }}
                    >
                      {getStatusLabel(test.status)}
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
                    <span className="progress-label">
                      {test.status === 'completed' ? 'Điểm số' : 'Tiến độ'}
                    </span>
                    <span className="progress-percentage">{test.correctRate}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${test.correctRate}%`,
                        background: test.status === 'completed'
                          ? 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)'
                          : undefined
                      }}
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

              {/* Action Buttons — khác nhau theo trạng thái */}
              <div className="card-actions">
                {test.status === 'completed' ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => test.sessionId && onViewResult?.(test.sessionId)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Xem kết quả</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onStartTest?.(test.partId || test.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Làm lại</span>
                    </button>
                  </>
                ) : test.status === 'in-progress' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => test.sessionId && onContinueTest?.(test.sessionId)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tiếp tục bài làm</span>
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => onStartTest?.(test.partId || test.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Bắt đầu luyện tập</span>
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