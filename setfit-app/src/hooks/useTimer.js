import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings, useWorkoutStats } from './useDatabase';
import { SETTING_KEYS } from '../constants/database';

export const useTimer = (initialTime = 300) => {
  const [time, setTime] = useState(initialTime);
  const [initialTime_, setInitialTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Database hooks
  const { getSetting } = useSettings();
  const { saveWorkout } = useWorkoutStats();

  // Get user preferences
  const vibrationEnabled = getSetting(SETTING_KEYS.VIBRATION_ENABLED, true);
  const soundsEnabled = getSetting(SETTING_KEYS.SOUNDS_ENABLED, true);

  useEffect(() => {
    if (isActive && !isPaused && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;

          // Haptic feedback en los últimos 3 segundos (respeta configuración)
          if (newTime <= 3 && newTime > 0 && vibrationEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Timer completado
          if (newTime === 0) {
            setIsActive(false);
            setIsPaused(false);

            // Feedback al completar (respeta configuración)
            if (vibrationEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            // Guardar workout en la base de datos
            try {
              saveWorkout(initialTime_, true);
            } catch (error) {
              console.error('Failed to save workout:', error);
            }
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