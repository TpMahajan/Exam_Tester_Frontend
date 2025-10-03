import React, { useState, useEffect, useCallback } from 'react';
import { examAttemptAPI } from '../services/api';

const Timer = ({ duration, onTimeUp, examId, attemptId, initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime || duration * 60); // Convert minutes to seconds
  const [isActive, setIsActive] = useState(true);

  const updateServerTime = useCallback(async (remainingTime) => {
    try {
      if (attemptId) {
        await examAttemptAPI.updateTime(attemptId, remainingTime);
      }
    } catch (error) {
      console.error('Failed to update server time:', error);
    }
  }, [attemptId]);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          const newTime = timeLeft - 1;
          
          // Update server every 30 seconds
          if (newTime % 30 === 0 && attemptId) {
            updateServerTime(newTime);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onTimeUp();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimeUp, updateServerTime, attemptId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 300) return 'timer danger'; // Last 5 minutes
    if (timeLeft <= 600) return 'timer warning'; // Last 10 minutes
    return 'timer';
  };

  const getTimeStatus = () => {
    if (timeLeft <= 300) return '⚠️ CRITICAL - Less than 5 minutes!';
    if (timeLeft <= 600) return '⏰ WARNING - Less than 10 minutes!';
    return '⏱️ Time Remaining';
  };

  if (!isActive) {
    return (
      <div className="timer danger">
        <div style={{ fontSize: '18px', marginBottom: '5px' }}>⏰</div>
        <div>Time's Up! Exam has ended.</div>
      </div>
    );
  }

  return (
    <div className={getTimerClass()}>
      <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>
        {getTimeStatus()}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default Timer;
