import { useState, useCallback, useRef, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { EXERCISE_TYPES, BLOCK_TYPES } from '../models/routines';

export const WORKOUT_STATES = {
  PREPARING: 'preparing',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  STOPPED: 'stopped',
};

export const useWorkoutExecution = () => {
  const { db, isReady } = useDatabase();
  const [workoutState, setWorkoutState] = useState(WORKOUT_STATES.PREPARING);
  const [currentWorkoutSession, setCurrentWorkoutSession] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [pauseTimestamps, setPauseTimestamps] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseStartRef = useRef(null);

  // Start a new workout session
  const startWorkout = useCallback(async (routine, workoutBlocks, userId = 1) => {
    try {
      // Validate inputs
      if (!workoutBlocks || workoutBlocks.length === 0) {
        throw new Error('No blocks provided for workout');
      }

      if (!db || !isReady) {
        throw new Error('Database not ready');
      }

      // Validate routine data
      if (!routine) {
        throw new Error('No routine provided');
      }

      console.log('Starting workout with:', { routine: routine.name, blocks: workoutBlocks.length });

      // Create new workout session in database
      const result = await db.runAsync(
        `INSERT INTO workout_sessions
         (user_id, routine_id, duration, session_state, current_block_index,
          current_set, blocks_data, started_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          routine?.id || null,
          0, // Initial duration
          WORKOUT_STATES.PREPARING,
          0,
          1,
          JSON.stringify(workoutBlocks),
          new Date().toISOString()
        ]
      );

      const sessionData = {
        id: result.lastInsertRowId,
        userId,
        routineId: routine?.id || null,
        routineName: routine?.name || 'Entrenamiento Libre',
        blocks: workoutBlocks,
        startedAt: new Date().toISOString(),
      };

      setCurrentWorkoutSession(sessionData);
      setBlocks(workoutBlocks);
      setCurrentBlockIndex(0);
      setCurrentSet(1);
      setCurrentTimer(0);
      setTotalElapsedTime(0);
      setPauseTimestamps([]);
      setWorkoutState(WORKOUT_STATES.PREPARING);

      return sessionData;
    } catch (error) {
      console.error('Error starting workout:', error);
      throw error;
    }
  }, [db, isReady]);

  // Begin active workout (after preparation)
  const beginActiveWorkout = useCallback(() => {
    if (workoutState !== WORKOUT_STATES.PREPARING) return;

    setWorkoutState(WORKOUT_STATES.ACTIVE);
    startTimeRef.current = Date.now();

    // Start main timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setTotalElapsedTime(elapsed);
    }, 1000);
  }, [workoutState]);

  // Pause workout
  const pauseWorkout = useCallback(async () => {
    if (workoutState !== WORKOUT_STATES.ACTIVE) return;

    setWorkoutState(WORKOUT_STATES.PAUSED);
    pauseStartRef.current = Date.now();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Update database
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET session_state = ?, current_block_index = ?, current_set = ?,
             duration = ?, pause_timestamps = ?
         WHERE id = ?`,
        [
          WORKOUT_STATES.PAUSED,
          currentBlockIndex,
          currentSet,
          totalElapsedTime,
          JSON.stringify([...pauseTimestamps, { pausedAt: new Date().toISOString() }]),
          currentWorkoutSession.id
        ]
      );
    }
  }, [workoutState, currentWorkoutSession, currentBlockIndex, currentSet, totalElapsedTime, pauseTimestamps, db]);

  // Resume workout
  const resumeWorkout = useCallback(async () => {
    if (workoutState !== WORKOUT_STATES.PAUSED) return;

    setWorkoutState(WORKOUT_STATES.ACTIVE);

    // Calculate pause duration and adjust start time
    const pauseDuration = Date.now() - pauseStartRef.current;
    startTimeRef.current += pauseDuration;

    // Update pause timestamps
    const updatedPauses = [...pauseTimestamps];
    if (updatedPauses.length > 0) {
      updatedPauses[updatedPauses.length - 1].resumedAt = new Date().toISOString();
    }
    setPauseTimestamps(updatedPauses);

    // Restart timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setTotalElapsedTime(elapsed);
    }, 1000);

    // Update database
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET session_state = ?, pause_timestamps = ?
         WHERE id = ?`,
        [
          WORKOUT_STATES.ACTIVE,
          JSON.stringify(updatedPauses),
          currentWorkoutSession.id
        ]
      );
    }
  }, [workoutState, pauseTimestamps, currentWorkoutSession, db]);

  // Move to next set or block
  const nextAction = useCallback(async () => {
    if (!blocks.length || currentBlockIndex >= blocks.length) return;

    const currentBlock = blocks[currentBlockIndex];
    const totalSets = currentBlock.sets || 1;

    if (currentSet < totalSets) {
      // Next set in current block
      setCurrentSet(currentSet + 1);
      setCurrentTimer(0);
    } else if (currentBlockIndex < blocks.length - 1) {
      // Next block
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentSet(1);
      setCurrentTimer(0);
    } else {
      // Workout completed
      await completeWorkout();
      return;
    }

    // Update database
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET current_block_index = ?, current_set = ?, duration = ?
         WHERE id = ?`,
        [
          currentSet < totalSets ? currentBlockIndex : currentBlockIndex + 1,
          currentSet < totalSets ? currentSet + 1 : 1,
          totalElapsedTime,
          currentWorkoutSession.id
        ]
      );
    }
  }, [blocks, currentBlockIndex, currentSet, totalElapsedTime, currentWorkoutSession, db]);

  // Skip current exercise
  const skipExercise = useCallback(async () => {
    if (!blocks.length || currentBlockIndex >= blocks.length - 1) {
      await completeWorkout();
      return;
    }

    // Move to next block
    setCurrentBlockIndex(currentBlockIndex + 1);
    setCurrentSet(1);
    setCurrentTimer(0);

    // Update database
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET current_block_index = ?, current_set = ?, duration = ?
         WHERE id = ?`,
        [
          currentBlockIndex + 1,
          1,
          totalElapsedTime,
          currentWorkoutSession.id
        ]
      );
    }
  }, [blocks, currentBlockIndex, totalElapsedTime, currentWorkoutSession, db]);

  // Complete workout
  const completeWorkout = useCallback(async () => {
    setWorkoutState(WORKOUT_STATES.COMPLETED);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Update database with completion
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET session_state = ?, completed = 1, duration = ?, completed_at = ?
         WHERE id = ?`,
        [
          WORKOUT_STATES.COMPLETED,
          totalElapsedTime,
          new Date().toISOString(),
          currentWorkoutSession.id
        ]
      );
    }
  }, [currentWorkoutSession, totalElapsedTime, db]);

  // Stop workout (quit early)
  const stopWorkout = useCallback(async () => {
    setWorkoutState(WORKOUT_STATES.STOPPED);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Update database as stopped
    if (currentWorkoutSession?.id) {
      await db.runAsync(
        `UPDATE workout_sessions
         SET session_state = ?, duration = ?, completed_at = ?
         WHERE id = ?`,
        [
          WORKOUT_STATES.STOPPED,
          totalElapsedTime,
          new Date().toISOString(),
          currentWorkoutSession.id
        ]
      );
    }
  }, [currentWorkoutSession, totalElapsedTime, db]);

  // Get current block info
  const getCurrentBlock = useCallback(() => {
    if (!blocks.length || currentBlockIndex >= blocks.length) return null;
    return blocks[currentBlockIndex];
  }, [blocks, currentBlockIndex]);

  // Get progress information
  const getProgress = useCallback(() => {
    if (!blocks.length) return { percent: 0, completed: 0, total: 0 };

    const totalBlocks = blocks.length;
    const completedBlocks = currentBlockIndex;
    const currentBlock = getCurrentBlock();

    let totalSets = blocks.reduce((sum, block) => sum + (block.sets || 1), 0);
    let completedSets = blocks.slice(0, currentBlockIndex).reduce((sum, block) => sum + (block.sets || 1), 0);

    if (currentBlock) {
      completedSets += currentSet - 1;
    }

    return {
      percent: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
      completed: completedSets,
      total: totalSets,
      currentBlock: currentBlockIndex + 1,
      totalBlocks,
    };
  }, [blocks, currentBlockIndex, currentSet, getCurrentBlock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // State
    workoutState,
    currentWorkoutSession,
    currentBlockIndex,
    currentSet,
    currentTimer,
    totalElapsedTime,
    blocks,

    // Actions
    startWorkout,
    beginActiveWorkout,
    pauseWorkout,
    resumeWorkout,
    nextAction,
    skipExercise,
    completeWorkout,
    stopWorkout,

    // Getters
    getCurrentBlock,
    getProgress,

    // Computed
    isActive: workoutState === WORKOUT_STATES.ACTIVE,
    isPaused: workoutState === WORKOUT_STATES.PAUSED,
    isCompleted: workoutState === WORKOUT_STATES.COMPLETED,
    canPause: workoutState === WORKOUT_STATES.ACTIVE,
    canResume: workoutState === WORKOUT_STATES.PAUSED,
    canSkip: [WORKOUT_STATES.ACTIVE, WORKOUT_STATES.PAUSED].includes(workoutState),
  };
};