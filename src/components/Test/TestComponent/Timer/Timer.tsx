import React from 'react';
import { formatTime } from '../../../../utils/testHelper';
import './Timer.scss';

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const isWarning = timeLeft <= 300 && timeLeft > 0;

  return (
    <div className={`timer-container ${isWarning ? 'warning' : ''}`}>
      <span className="timer">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;