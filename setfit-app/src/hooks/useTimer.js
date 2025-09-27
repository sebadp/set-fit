import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

export const useTimer = (initialTime = 300) => {
  const [time, setTime] = useState(initialTime);
  const [initialTime_, setInitialTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;

          // Haptic feedback en los últimos 3 segundos
          if (newTime <= 3 && newTime > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Timer completado
          if (newTime === 0) {
            setIsActive(false);
            setIsPaused(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, time]);

  const start = () => {
    if (time > 0) {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    if (isActive) {
      setIsPaused(false);
    }
  };

  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    stop();
    setTime(initialTime_);
  };

  const setNewTime = (newTime) => {
    stop();
    setTime(newTime);
    setInitialTime(newTime);
  };

  const isLastSeconds = time <= 3 && time > 0 && isActive && !isPaused;

  return {
    time,
    isActive,
    isPaused,
    isLastSeconds,
    isCompleted: time === 0,
    start,
    pause,
    resume,
    stop,
    reset,
    setNewTime,
  };
};