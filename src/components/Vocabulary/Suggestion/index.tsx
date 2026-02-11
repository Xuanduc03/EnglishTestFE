import React, { useState, useEffect } from 'react';
import './Suggestion.scss';

export interface SuggestedWord {
  id: number;
  word: string;
  meaning: string;
  type: 'need-review' | 'related' | 'common';
  description: string;
  stats: string;
  buttonText: string;
}

// Không nhận props suggestedWords nữa
const SuggestSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState<SuggestedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    // Gọi API lấy từ vựng gợi ý
    const fetchSuggestedWords = async () => {
      setLoading(true);
      try {
        // Ví dụ: gọi API /api/suggested-words
        const res = await fetch('/api/suggested-words');
        const data = await res.json();
        setSuggestedWords(data);
      } catch (err) {
        setSuggestedWords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedWords();
  }, []);

  const handleWordClick = (word: SuggestedWord) => {
    // Xử lý khi click vào từ vựng
  };

  const getBadgeClass = (type: SuggestedWord['type']) => {
    switch (type) {
      case 'need-review':
        return 'badge need-review';
      case 'related':
        return 'badge related';
      case 'common':
        return 'badge common';
      default:
        return 'badge related';
    }
  };

  const getBadgeText = (type: SuggestedWord['type']) => {
    switch (type) {
      case 'need-review':
        return 'Cần ôn lại';
      case 'related':
        return 'Từ liên quan';
      case 'common':
        return 'Thường gặp';
      default:
        return 'Từ vựng';
    }
  };

  if (loading) {
    return (
      <section id="suggest-section" className={isVisible ? 'visible' : ''}>
        <div className="suggest-container">
          <p>Đang tải từ vựng gợi ý...</p>
        </div>
      </section>
    );
  }

  if (!suggestedWords || suggestedWords.length === 0) {
    return (
      <section id="suggest-section" className={isVisible ? 'visible' : ''}>
        <div className="suggest-container">
          <div className="suggest-empty">
            <div className="empty-icon">📚</div>
            <p className="empty-text">Chưa có từ vựng gợi ý</p>
            <p className="empty-subtext">
              Hoàn thành các bài quiz để nhận gợi ý từ vựng phù hợp
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="suggest-section" className={isVisible ? 'visible' : ''}>
      <div className="suggest-container">
        {/* Header */}
        <div className="suggest-header">
          <h2 className="suggest-title">💡 Từ Vựng Gợi ý</h2>
          <p className="suggest-subtitle">
            Dựa trên kết quả học tập, chúng tôi gợi ý các từ sau để bạn ôn lại
          </p>
        </div>

        {/* Cards Grid */}
        <div className="suggest-grid">
          {suggestedWords.map((word: SuggestedWord, index: number) => (
            <div
              key={word.id}
              className={`suggest-card ${word.type} ${index === 0 ? 'float-animation' : ''}`}
            >
              {/* Badge */}
              <div className="card-badge">
                <span className={getBadgeClass(word.type)}>
                  {getBadgeText(word.type)}
                </span>
              </div>

              {/* Content */}
              <div className="card-content">
                <h3 className="word">{word.word}</h3>
                <p className="meaning">{word.meaning}</p>
                
                <div className="stats-box">
                  <p className="stats-text" dangerouslySetInnerHTML={{ __html: word.stats }} />
                </div>
              </div>

              {/* Action Button */}
              <button
                className="action-button"
                onClick={() => handleWordClick(word)}
              >
                {word.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestSection;