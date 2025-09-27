import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  BackHandler,
  StatusBar,
  Vibration,
} from 'react-native';
// Removed React Navigation imports since we're using conditional navigation
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';
import { useWorkoutExecution, WORKOUT_STATES } from '../hooks/useWorkoutExecution';
import { EXERCISE_TYPES, formatDuration } from '../models/routines';
import { useDatabase } from '../hooks/useDatabase';

// Workout Components
import { ExerciseTransition } from '../components/workout/ExerciseTransition';
import { SeriesCounter } from '../components/workout/SeriesCounter';
import { WorkoutProgress } from '../components/workout/WorkoutProgress';
import { WorkoutControls } from '../components/workout/WorkoutControls';
import { SkipExerciseModal } from '../components/workout/SkipExerciseModal';
import { WorkoutSummary } from '../components/workout/WorkoutSummary';

export const WorkoutExecutionScreen = ({ route, navigation }) => {
  const { routine, blocks: initialBlocks } = route.params;

  // Database hook
  const { isReady: isDatabaseReady, isLoading: isDatabaseLoading } = useDatabase();

  // Workout execution hook
  const {
    workoutState,
    currentWorkoutSession,
    currentBlockIndex,
    currentSet,
    currentTimer,
    totalElapsedTime,
    blocks,
    startWorkout,
    beginActiveWorkout,
    pauseWorkout,
    resumeWorkout,
    nextAction,
    skipExercise,
    completeWorkout,
    stopWorkout,
    getCurrentBlock,
    getProgress,
    isActive,
    isPaused,
    isCompleted,
    canPause,
    canResume,
    canSkip,
  } = useWorkoutExecution();

  // Screen state
  const [showTransition, setShowTransition] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [transitionType, setTransitionType] = useState('preparation');
  const [currentReps, setCurrentReps] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState([]);
  const [skippedBlocks, setSkippedBlocks] = useState([]);
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(0);

  const timerRef = useRef(null);
  const hasStartedWorkout = useRef(false);

  // Initialize workout on component mount (only when database is ready)
  useEffect(() => {
    if (!hasStartedWorkout.current && initialBlocks?.length > 0 && isDatabaseReady) {
      initializeWorkout();
      hasStartedWorkout.current = true;
    }
  }, [initialBlocks, isDatabaseReady]);

  // Handle back button
  useEffect(() => {
    const onBackPress = () => {
      if (workoutState === WORKOUT_STATES.COMPLETED) {
        return false; // Allow normal back navigation
      }

      handleWorkoutExit();
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [workoutState]);

  // Timer for time-based exercises
  useEffect(() => {
    const currentBlock = getCurrentBlock();
    if (isActive && currentBlock?.exercise_type === EXERCISE_TYPES.TIME_BASED) {
      timerRef.current = setInterval(() => {
        setCurrentTimer(prev => {
          const newTimer = prev + 1;
          const targetDuration = currentBlock.duration || 0;

          // Auto-complete when time reaches target
          if (targetDuration > 0 && newTimer >= targetDuration) {
            handleSetComplete();
            return 0;
          }
          return newTimer;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, currentBlockIndex, currentSet]);

  // Calculate estimated total time
  useEffect(() => {
    if (blocks.length > 0) {
      const total = blocks.reduce((sum, block) => {
        let blockTime = 0;
        if (block.exercise_type === EXERCISE_TYPES.TIME_BASED) {
          blockTime = (block.duration || 0) * (block.sets || 1);
        } else {
          blockTime = Math.max((block.reps || 0) * 2, 15) * (block.sets || 1);
        }
        if (block.sets > 1) {
          blockTime += (block.rest_between_sets || 0) * (block.sets - 1);
        }
        return sum + blockTime;
      }, 0);
      setEstimatedTotalTime(total);
    }
  }, [blocks]);

  const initializeWorkout = async () => {
    try {
      console.log('Initializing workout with:', { routine: routine?.name, blocksCount: initialBlocks?.length });

      if (!routine) {
        throw new Error('No routine provided');
      }

      if (!initialBlocks || initialBlocks.length === 0) {
        throw new Error('No exercise blocks provided');
      }

      await startWorkout(routine, initialBlocks);
      showPreparationTransition();
    } catch (error) {
      console.error('Failed to initialize workout:', error);
      Alert.alert(
        'Error',
        `No se pudo iniciar el entrenamiento: ${error.message}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const showPreparationTransition = () => {
    setTransitionType('preparation');
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);

    if (transitionType === 'preparation') {
      beginActiveWorkout();
    } else if (transitionType === 'next_exercise' || transitionType === 'next_set') {
      // Reset counters for new block/set
      setCurrentTimer(0);
      setCurrentReps(0);
    }
  };

  const handleSetComplete = async () => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Vibration.vibrate(200);

      const currentBlock = getCurrentBlock();
      if (!currentBlock) return;

      // Add to completed blocks if this was the last set
      if (currentSet >= (currentBlock.sets || 1)) {
        setCompletedBlocks(prev => [...prev, { ...currentBlock, completedAt: new Date() }]);
      }

      // Check if we need rest between sets
      const needsRest = currentSet < (currentBlock.sets || 1) && (currentBlock.rest_between_sets || 0) > 0;

      if (needsRest) {
        // Show rest transition
        setTransitionType('rest');
        setShowTransition(true);

        // Auto-complete rest after duration
        setTimeout(() => {
          if (showTransition) {
            handleTransitionComplete();
            nextAction();
          }
        }, (currentBlock.rest_between_sets || 0) * 1000);
      } else {
        // Move to next set or exercise
        const isLastSet = currentSet >= (currentBlock.sets || 1);
        const isLastBlock = currentBlockIndex >= blocks.length - 1;

        if (isLastSet && isLastBlock) {
          // Workout completed
          await completeWorkout();
        } else if (isLastSet) {
          // Next exercise
          const nextBlock = blocks[currentBlockIndex + 1];
          setTransitionType('next_exercise');
          setShowTransition(true);

          setTimeout(() => {
            if (showTransition) {
              handleTransitionComplete();
              nextAction();
            }
          }, 3000);
        } else {
          // Next set
          setTransitionType('next_set');
          setShowTransition(true);

          setTimeout(() => {
            if (showTransition) {
              handleTransitionComplete();
              nextAction();
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error completing set:', error);
    }
  };

  const handleSkipSet = () => {
    setShowSkipModal(false);
    nextAction();
  };

  const handleSkipExercise = () => {
    const currentBlock = getCurrentBlock();
    if (currentBlock) {
      setSkippedBlocks(prev => [...prev, { ...currentBlock, skippedAt: new Date() }]);
    }
    setShowSkipModal(false);
    skipExercise();
  };

  const handleWorkoutExit = () => {
    Alert.alert(
      '⚠️ Salir del Entrenamiento',
      '¿Estás seguro de que quieres salir? Tu progreso se guardará.',
      [
        { text: 'Continuar Entrenamiento', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await stopWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleWorkoutComplete = () => {
    // Stay on summary screen
  };

  const handleSaveAndContinue = () => {
    navigation.goBack();
  };

  const handleShareResults = () => {
    // TODO: Implement share functionality
    Alert.alert('Compartir', 'Función de compartir próximamente disponible');
  };

  const handleStartNewWorkout = () => {
    navigation.navigate('Routines');
  };

  // Get current block for components
  const currentBlock = getCurrentBlock();
  const progress = getProgress();
  const isTimeBased = currentBlock?.exercise_type === EXERCISE_TYPES.TIME_BASED;

  // Show loading screen while database is initializing
  if (isDatabaseLoading || !isDatabaseReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando entrenamiento...</Text>
          <Text style={styles.loadingSubtext}>Inicializando base de datos</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show summary if completed
  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <WorkoutSummary
          workoutSession={currentWorkoutSession}
          blocks={blocks}
          completedBlocks={completedBlocks}
          skippedBlocks={skippedBlocks}
          totalElapsedTime={totalElapsedTime}
          pauseTimestamps={[]} // TODO: Get from workout execution
          onSaveAndContinue={handleSaveAndContinue}
          onShareResults={handleShareResults}
          onStartNewWorkout={handleStartNewWorkout}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <View style={styles.content}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <WorkoutProgress
            progress={progress}
            blocks={blocks}
            currentBlockIndex={currentBlockIndex}
            currentSet={currentSet}
            totalElapsedTime={totalElapsedTime}
            estimatedTotalTime={estimatedTotalTime}
            style={styles.progressComponent}
          />
        </View>

        {/* Main Exercise Content */}
        <View style={styles.exerciseContent}>
          {currentBlock && workoutState !== WORKOUT_STATES.PREPARING && (
            <SeriesCounter
              block={currentBlock}
              currentSet={currentSet}
              totalSets={currentBlock.sets || 1}
              currentRep={currentReps}
              isTimeBased={isTimeBased}
              timer={currentTimer}
              onSetComplete={handleSetComplete}
              onRepsChange={setCurrentReps}
              style={styles.seriesCounter}
            />
          )}
        </View>

        {/* Controls Footer */}
        <View style={styles.controlsFooter}>
          <WorkoutControls
            workoutState={workoutState}
            onPause={pauseWorkout}
            onResume={resumeWorkout}
            onSkip={() => setShowSkipModal(true)}
            onStop={handleWorkoutExit}
            onComplete={handleWorkoutComplete}
            canPause={canPause}
            canResume={canResume}
            canSkip={canSkip}
            showComplete={progress.percent >= 100}
          />
        </View>
      </View>

      {/* Transition Overlay */}
      {showTransition && (
        <ExerciseTransition
          fromBlock={currentBlockIndex > 0 ? blocks[currentBlockIndex - 1] : null}
          toBlock={currentBlock}
          transitionType={transitionType}
          duration={transitionType === 'preparation' ? 5 : transitionType === 'rest' ? (currentBlock?.rest_between_sets || 10) : 3}
          onTransitionComplete={handleTransitionComplete}
          onSkip={handleTransitionComplete}
        />
      )}

      {/* Skip Modal */}
      <SkipExerciseModal
        visible={showSkipModal}
        block={currentBlock}
        currentSet={currentSet}
        totalSets={currentBlock?.sets || 1}
        onSkipSet={handleSkipSet}
        onSkipExercise={handleSkipExercise}
        onCancel={() => setShowSkipModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  progressHeader: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressComponent: {
    // No additional styles needed
  },
  exerciseContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  seriesCounter: {
    flex: 1,
  },
  controlsFooter: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingSubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});