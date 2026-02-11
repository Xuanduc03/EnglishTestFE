import React from "react";
import './QuestionPart1.scss';

type Props = {
  total: number;
  current: number;
  onSelect: (n: number) => void;
};

const SidebarPagination: React.FC<Props> = ({ total, current, onSelect }) => {
  const items = Array.from({ length: total }, (_, i) => i + 1);
  
  // Mock statistics
  const stats = {
    correct: 0,
    incorrect: 0,
    unanswered: 5
  };

  return (
    <div className="sidebar-pager">
      <div className="summary">
        <div className="title">Câu hỏi 1-{total}</div>
        <div className="legend">
          <div>
            <span className="dot green" />
            <span className="stat-text">{stats.correct}/{total} Đúng</span>
          </div>
          <div>
            <span className="dot red" />
            <span className="stat-text">{stats.incorrect}/{total} Sai</span>
          </div>
          <div>
            <span className="dot light" />
            <span className="stat-text">{stats.unanswered}/{total} Chưa trả lời</span>
          </div>
        </div>
      </div>
      
      <div className="pager">
        {items.map((n) => (
          <button
            key={n}
            className={`pager-btn ${n === current ? "active" : ""}`}
            onClick={() => onSelect(n)}
            aria-label={`Go to question ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      
      {/* Additional Actions */}
      <div className="sidebar-actions">
        <button className="action-btn flag-btn" title="Flag question">
          🚩 Flag
        </button>
        <button className="action-btn review-btn" title="Mark for review">
          📝 Review
        </button>
      </div>
    </div>
  );
};

export default SidebarPagination;