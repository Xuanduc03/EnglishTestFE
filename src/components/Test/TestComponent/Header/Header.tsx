import React, { useState } from 'react';
import { Popover, Slider } from 'antd';
import {
  LogoutOutlined,
  SoundFilled,
  ClockCircleOutlined
} from '@ant-design/icons';
import Timer from '../Timer/Timer'; 
import './Header.scss';

interface HeaderProps {
  timeLeft: number;
  onSubmit: () => void;
  onExit?: () => void;
  sectionTitle?: string;
  answeredCount?: number;
  totalQuestions?: number;
  currentQuestion?: number;
  currentSection?: 'listening' | 'reading';
  logoUrl?: string;
  onVolumeChange?: (volume: number) => void;
  /** Disable Submit button when exam is being submitted */
  isSubmitting?: boolean;
  /** Disable Exit button when exit-submit is in flight */
  isExiting?: boolean;
  /** Optional flag to hide the countdown timer */
  hideTimer?: boolean;
  /** Optional flag to hide the volume button */
  hideVolume?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  timeLeft,
  onSubmit,
  onExit,
  answeredCount = 0,
  totalQuestions = 200,
  currentQuestion = 1,
  currentSection = 'listening',
  logoUrl,
  onVolumeChange,
  isSubmitting = false,
  isExiting = false,
  hideTimer = false,
  hideVolume = false,
}) => {
  const [volume, setVolume] = useState(75);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    onVolumeChange?.(value / 100);
  };

  const isListening = currentSection === 'listening';
  const sectionText = isListening ? 'Listening' : 'Reading';

  // Nội dung của popover chỉnh âm lượng
  const volumeContent = (
    <div style={{ width: 140, padding: '0 8px' }}>
      <Slider 
        min={0} 
        max={100} 
        value={volume} 
        onChange={handleVolumeChange} 
        tooltip={{ formatter: (val) => `${val}%` }}
      />
    </div>
  );

  return (
    <header className="iig-header">
      {/* --- CỘT TRÁI: Logo & Nút Thoát --- */}
      <div className="iig-header-left">
        {onExit && (
          <button
            className={`iig-exit-btn ${isExiting ? 'iig-exit-btn--loading' : ''}`}
            onClick={onExit}
            disabled={isExiting || isSubmitting}
            title="Exit exam"
          >
            {isExiting ? (
              <span className="iig-btn-spinner" />
            ) : (
              <LogoutOutlined />
            )}
          </button>
        )}
      </div>

      {/* --- CỘT GIỮA: Tiêu đề chuẩn IIG --- */}
      <div className="iig-header-center">
        {sectionText}: Questions {currentQuestion} of {totalQuestions}
      </div>

      {/* --- CỘT PHẢI: Volume, Progress, Timer, Submit --- */}
      <div className="iig-header-right">
        {isListening && !hideVolume && (
          <Popover content={volumeContent} title="Âm lượng" trigger="click" placement="bottomRight">
            <button className="iig-btn btn-volume">
              <SoundFilled />
            </button>
          </Popover>
        )}

        {/* Khung đếm số câu đã làm: Nền trắng, chữ đen */}
        <div className="iig-badge badge-progress">
          {answeredCount}/{totalQuestions}
        </div>

        {/* Khung đếm ngược thời gian: Nền xanh lơ, chữ trắng */}
        {!hideTimer && (
          <div className="iig-badge badge-timer">
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            <Timer timeLeft={timeLeft} />
          </div>
        )}

        {/* Submit button — disabled while submitting or exiting */}
        <button
          className={`iig-btn btn-submit ${isSubmitting ? 'btn-submit--loading' : ''}`}
          onClick={onSubmit}
          disabled={isSubmitting || isExiting}
        >
          {isSubmitting ? (
            <><span className="iig-btn-spinner" /> Submitting…</>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;