import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import { EXERCISE_TYPES, formatDuration } from '../../models/routines';

export const SeriesCounterMinimal = ({
  block,
  currentSet,
  totalSets,
  currentRep = 0,
  isTimeBased = false,
  timer = 0,
  onSetComplete,
  onRepsChange,
  style,
}) => {
  const { theme } = useTheme();
  const [localReps, setLocalReps] = useState(currentRep);

  useEffect(() => {
    setLocalReps(currentRep);
  }, [currentRep]);

  const handleRepIncrement = () => {
    const newReps = localReps + 1;
    setLocalReps(newReps);
    onRepsChange?.(newReps);

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
          <View
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

        <View style={styles.repDisplay}>
          <Text style={styles.repCount}>{localReps}</Text>
          <Text style={styles.repTarget}>
            {block?.reps ? `/ ${block.reps}` : ''}
          </Text>
        </View>

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
          <View
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
    <View style={[styles.container, style]}>
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

        {/* Main Counter */}
        <View style={styles.mainContent}>
          {isTimeBased ? renderTimeBased() : renderRepBased()}
        </View>
      </Card>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  setInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  setLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  setCounter: {
    fontSize: 32,
    color: '#10B981',
    fontWeight: 'bold',
  },
  exerciseInfo: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  exerciseType: {
    fontSize: 14,
    color: '#888',
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
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    color: '#10B981',
    fontWeight: 'bold',
  },
  timerTarget: {
    fontSize: 16,
    color: '#666',
  },
  repBasedContainer: {
    alignItems: 'center',
  },
  repCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  repButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  repButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  repDisplay: {
    alignItems: 'center',
    minWidth: 120,
  },
  repCount: {
    fontSize: 64,
    color: '#10B981',
    fontWeight: 'bold',
  },
  repTarget: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonActive: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
};