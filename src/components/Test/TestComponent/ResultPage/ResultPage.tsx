import React from 'react';
import './ResultPage.scss';

interface ResultPageProps {
  onReview?: () => void;
  onRetry?: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ onReview, onRetry }) => {
  return (
    <div className="result-page">
      <div className="result-container">
        <h2 className="result-title">🎉 Hoàn Thành Bài Thi!</h2>
        <p className="result-subtitle">
          Chúc mừng bạn đã hoàn thành bài thi. Dưới đây là kết quả của bạn.
        </p>
        
        <div className="score-grid">
          <div className="score-card listening">
            <p className="score-label">LISTENING</p>
            <p className="score-value">450</p>
            <div className="score-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <span className="progress-text">75%</span>
            </div>
          </div>
          
          <div className="score-card reading">
            <p className="score-label">READING</p>
            <p className="score-value">425</p>
            <div className="score-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '70%' }}></div>
              </div>
              <span className="progress-text">70%</span>
            </div>
          </div>
          
          <div className="score-card total">
            <p className="score-label">TỔNG ĐIỂM</p>
            <p className="score-value">875</p>
            <div className="score-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '72.5%' }}></div>
              </div>
              <span className="progress-text">72.5%</span>
            </div>
          </div>
        </div>

        <div className="performance-section">
          <h3 className="performance-title">Tiến độ làm bài của bạn</h3>
          <div className="performance-chart">
            <svg viewBox="0 0 300 120" className="chart-svg">
              {/* Grid lines */}
              <line x1="20" y1="20" x2="20" y2="100" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Data line */}
              <polyline 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth="3" 
                points="40,80 80,60 120,70 160,40 200,50 240,20 280,30" 
              />
              
              {/* Data points */}
              <circle cx="40" cy="80" r="4" fill="#4f46e5" />
              <circle cx="80" cy="60" r="4" fill="#4f46e5" />
              <circle cx="120" cy="70" r="4" fill="#4f46e5" />
              <circle cx="160" cy="40" r="4" fill="#4f46e5" />
              <circle cx="200" cy="50" r="4" fill="#4f46e5" />
              <circle cx="240" cy="20" r="4" fill="#4f46e5" />
              <circle cx="280" cy="30" r="4" fill="#4f46e5" />
              
              {/* Labels */}
              <text x="40" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">1</text>
              <text x="80" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">2</text>
              <text x="120" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">3</text>
              <text x="160" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">4</text>
              <text x="200" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">5</text>
              <text x="240" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">6</text>
              <text x="280" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">7</text>
            </svg>
          </div>
        </div>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">145</div>
              <div className="stat-label">Câu đúng</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-value">55</div>
              <div className="stat-label">Câu sai</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">98</div>
              <div className="stat-label">Phút</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn review-btn" onClick={onReview}>
            Xem lại câu sai
          </button>
          <button className="action-btn retry-btn" onClick={onRetry}>
            Làm lại bài thi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;