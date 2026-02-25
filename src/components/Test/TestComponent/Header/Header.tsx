import React, { useState } from 'react';
import Timer from '../Timer/Timer';
import './Header.scss';

interface HeaderProps {
  timeLeft: number;
  onSubmit: () => void;
  sectionTitle?: string;               // Ví dụ: "Listening: Questions 1 of 200"
  answeredCount?: number;              // Số câu đã làm
  totalQuestions?: number;             // Tổng câu, mặc định 200
  logoUrl?: string;                    // Logo IIG
  onVolumeChange?: (volume: number) => void; // Callback để điều chỉnh volume toàn app (nếu có)
}

const Header: React.FC<HeaderProps> = ({
  timeLeft,
  onSubmit,
  sectionTitle = 'Bài Thi Thử TOEIC Full Test',
  answeredCount = 0,
  totalQuestions = 200,
  logoUrl = 'https://iigvietnam.com/images/logo-iig.png', // Logo chính thức IIG (có thể thay)
  onVolumeChange,
}) => {

  const [volume, setVolume] = useState(75); // Mặc định 75% giống thi thật
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume / 100); // Gửi volume 0-1 về parent nếu cần
  };

  return (
    <header className="test-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Bài Thi Thử TOEIC Full Test</h1>
        </div>

        {/* Bên phải: Volume + Progress + Timer + Submit */}
        <div className="header-right">
          {/* Volume Control */}
          <div className="volume-control">
            <button
              className="volume-btn"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
            {showVolumeSlider && (
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-range"
                />
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="progress-info">
            <span className="answered-count">
              {answeredCount}/{totalQuestions}
            </span>
          </div>

          {/* Timer */}
          <Timer timeLeft={timeLeft} />

          {/* Submit */}
          <button className="submit-btn" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;