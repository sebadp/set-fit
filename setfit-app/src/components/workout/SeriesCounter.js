import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { theme } from '../../constants/theme';
import { EXERCISE_TYPES, formatDuration } from '../../models/routines';

export const SeriesCounter = ({
  block,
  currentSet,
  totalSets,
  currentRep = 0,
  isTimeBased = false,
  timer = 0,
  onSetComplete,
  onRepsChange,
  onTimerChange,
  style,
}) => {
  const [localReps, setLocalReps] = useState(currentRep);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setLocalReps(currentRep);
  }, [currentRep]);

  const handleRepIncrement = () => {
    const newReps = localReps + 1;
    setLocalReps(newReps);
    onRepsChange?.(newReps);

    // Animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if set is complete
    const targetReps = block?.reps || 0;
    if (targetReps > 0 && newReps >= targetReps) {
      setTimeout(() => onSetComplete?.(), 500);
    }
  };

  const handleRepDecrement = () => {
    if (localReps > 0) {
      const newReps = localReps - 1;
      setLocalReps(newReps);
      onRepsChange?.(newReps);
    }
  };

  const handleSetComplete = () => {
    onSetComplete?.();
  };

  const getProgressPercentage = () => {
    if (isTimeBased) {
      const targetTime = block?.duration || 0;
      return targetTime > 0 ? Math.min((timer / targetTime) * 100, 100) : 0;
    } else {
      const targetReps = block?.reps || 0;
      return targetReps > 0 ? Math.min((localReps / targetReps) * 100, 100) : 0;
    }
  };

  const renderTimeBased = () => (
    <View style={styles.timeBasedContainer}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{formatDuration(timer)}</Text>
        <Text style={styles.timerTarget}>
          {block?.duration ? `/ ${formatDuration(block.duration)}` : ''}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {getProgressPercentage().toFixed(0)}% completado
        </Text>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleSetComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>✓ Completar Serie</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRepBased = () => (
    <View style={styles.repBasedContainer}>
      <View style={styles.repCounter}>
        <TouchableOpacity
          style={styles.repButton}
          onPress={handleRepDecrement}
          activeOpacity={0.7}
          disabled={localReps <= 0}
        >
          <Text style={styles.repButtonText}>−</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.repDisplay,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.repCount}>{localReps}</Text>
          <Text style={styles.repTarget}>
            {block?.reps ? `/ ${block.reps}` : ''}
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.repButton}
          onPress={handleRepIncrement}
          activeOpacity={0.7}
        >
          <Text style={styles.repButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {getProgressPercentage().toFixed(0)}% completado
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.completeButton,
          localReps >= (block?.reps || 0) && styles.completeButtonActive,
        ]}
        onPress={handleSetComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>
          {localReps >= (block?.reps || 0) ? '✓ Serie Completada' : '→ Siguiente Serie'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <Card style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.setInfo}>
            <Text style={styles.setLabel}>Serie Actual</Text>
            <Text style={styles.setCounter}>
              {currentSet} de {totalSets}
            </Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{block?.exercise_name || 'Ejercicio'}</Text>
            <Text style={styles.exerciseType}>
              {isTimeBased ? '⏱️ Basado en tiempo' : '🔢 Basado en repeticiones'}
            </Text>
          </View>
        </View>

        {/* Set Progress Indicator */}
        <View style={styles.setProgress}>
          <Text style={styles.setProgressLabel}>Progreso de Series:</Text>
          <View style={styles.setDots}>
            {Array.from({ length: totalSets }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.setDot,
                  index < currentSet - 1 && styles.setDotCompleted,
                  index === currentSet - 1 && styles.setDotActive,
                ]}
              >
                <Text style={styles.setDotText}>
                  {index < currentSet - 1 ? '✓' : index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Main Counter */}
        <View style={styles.mainContent}>
          {isTimeBased ? renderTimeBased() : renderRepBased()}
        </View>

        {/* Instructions */}
        {block?.instructions && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>📝 Instrucciones:</Text>
            <Text style={styles.instructionsText}>{block.instructions}</Text>
          </View>
        )}

        {/* Rest indicator for between sets */}
        {currentSet < totalSets && block?.rest_between_sets > 0 && (
          <View style={styles.restInfo}>
            <Text style={styles.restText}>
              ⏸️ Descanso entre series: {formatDuration(block.rest_between_sets)}
            </Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  setInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  setLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  setCounter: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    alignItems: 'center',
  },
  exerciseName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  exerciseType: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  setProgress: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  setProgressLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  setDots: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  setDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setDotCompleted: {
    backgroundColor: theme.colors.success,
  },
  setDotActive: {
    backgroundColor: theme.colors.primary,
  },
  setDotText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timeBasedContainer: {
    alignItems: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerText: {
    ...theme.typography.display,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 48,
  },
  timerTarget: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
  repBasedContainer: {
    alignItems: 'center',
  },
  repCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  repButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  repButtonText: {
    ...theme.typography.h1,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  repDisplay: {
    alignItems: 'center',
    minWidth: 120,
  },
  repCount: {
    ...theme.typography.display,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 64,
  },
  repTarget: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  progressTrack: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  progressText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  completeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  completeButtonText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  instructions: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  instructionsTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  instructionsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  restInfo: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: `${theme.colors.warning}15`,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  restText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    fontWeight: '600',
  },
});