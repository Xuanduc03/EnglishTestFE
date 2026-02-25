import React from 'react';
import { formatTime } from '../../../../utils/testHelper';
import './Timer.scss';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const isWarning = timeLeft <= 300 && timeLeft > 0;

  return (
    <div className={`timer-container ${isWarning ? 'warning' : ''}`}>
      <FontAwesomeIcon icon={faClock} className='timer__icon' />
      <span className="timer">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;