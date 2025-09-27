import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import { BLOCK_TYPES, EXERCISE_TYPES, formatDuration } from '../../models/routines';

export const ExerciseTransition = ({
  fromBlock,
  toBlock,
  transitionType = 'next_exercise', // 'next_exercise', 'next_set', 'rest', 'preparation'
  duration = 10, // seconds
  onTransitionComplete,
  onSkip,
  style,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const intervalRef = useRef(null);

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start countdown
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setTimeRemaining(duration);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completeTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeTransition = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Exit animation then callback
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onTransitionComplete?.();
    });
  };

  const handleSkip = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onSkip?.();
  };

  const getTransitionInfo = () => {
    switch (transitionType) {
      case 'next_exercise':
        return {
          title: '🏃 Siguiente Ejercicio',
          subtitle: `Prepárate para: ${toBlock?.exercise_name || 'Próximo ejercicio'}`,
          color: theme.colors.primary,
          icon: '→',
        };
      case 'next_set':
        return {
          title: '🔄 Siguiente Serie',
          subtitle: `Continuando: ${fromBlock?.exercise_name || 'Ejercicio actual'}`,
          color: theme.colors.info,
          icon: '↻',
        };
      case 'rest':
        return {
          title: '⏸️ Descanso',
          subtitle: 'Recupera energías para la siguiente serie',
          color: theme.colors.warning,
          icon: '⏱️',
        };
      case 'preparation':
        return {
          title: '🏁 Preparación',
          subtitle: 'Alístate para comenzar el entrenamiento',
          color: theme.colors.success,
          icon: '🚀',
        };
      default:
        return {
          title: '⏭️ Transición',
          subtitle: 'Preparándose...',
          color: theme.colors.textSecondary,
          icon: '→',
        };
    }
  };

  const transitionInfo = getTransitionInfo();

  const getExerciseDetails = (block) => {
    if (!block) return null;

    const details = [];
    if (block.exercise_type === EXERCISE_TYPES.REP_BASED) {
      details.push(`${block.reps || 0} repeticiones`);
    } else if (block.exercise_type === EXERCISE_TYPES.TIME_BASED) {
      details.push(`${formatDuration(block.duration || 0)}`);
    }

    if (block.sets && block.sets > 1) {
      details.push(`${block.sets} series`);
    }

    return details.join(' • ');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card style={[styles.card, { borderColor: transitionInfo.color }]}>
        {/* Header with countdown */}
        <View style={[styles.header, { backgroundColor: `${transitionInfo.color}15` }]}>
          <View style={styles.titleSection}>
            <Text style={styles.icon}>{transitionInfo.icon}</Text>
            <View>
              <Text style={styles.title}>{transitionInfo.title}</Text>
              <Text style={styles.subtitle}>{transitionInfo.subtitle}</Text>
            </View>
          </View>
          <View style={[styles.countdown, { backgroundColor: transitionInfo.color }]}>
            <Text style={styles.countdownText}>{timeRemaining}</Text>
          </View>
        </View>

        {/* Exercise details */}
        {(fromBlock || toBlock) && (
          <View style={styles.exerciseDetails}>
            {fromBlock && transitionType !== 'next_exercise' && (
              <View style={styles.exerciseCard}>
                <Text style={styles.exerciseLabel}>Ejercicio Actual:</Text>
                <Text style={styles.exerciseName}>{fromBlock.exercise_name}</Text>
                {getExerciseDetails(fromBlock) && (
                  <Text style={styles.exerciseInfo}>{getExerciseDetails(fromBlock)}</Text>
                )}
              </View>
            )}

            {toBlock && (
              <View style={styles.exerciseCard}>
                <Text style={styles.exerciseLabel}>
                  {transitionType === 'next_exercise' ? 'Siguiente:' : 'Después del descanso:'}
                </Text>
                <Text style={styles.exerciseName}>{toBlock.exercise_name}</Text>
                {getExerciseDetails(toBlock) && (
                  <Text style={styles.exerciseInfo}>{getExerciseDetails(toBlock)}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: transitionInfo.color,
                  width: `${((duration - timeRemaining) / duration) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDuration(timeRemaining)} restantes
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            title="⏭️ Saltar"
            onPress={handleSkip}
            variant="ghost"
            size="large"
            style={styles.skipButton}
          />
          <Button
            title={`${transitionInfo.icon} Continuar`}
            onPress={completeTransition}
            variant="primary"
            size="large"
            style={[styles.continueButton, { backgroundColor: transitionInfo.color }]}
          />
        </View>

        {/* Tips */}
        {transitionType === 'rest' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Durante el descanso:</Text>
            <Text style={styles.tipText}>• Mantén una respiración controlada</Text>
            <Text style={styles.tipText}>• Hidrátate si es necesario</Text>
            <Text style={styles.tipText}>• Prepárate mentalmente para el siguiente ejercicio</Text>
          </View>
        )}

        {transitionType === 'preparation' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>🚀 Antes de empezar:</Text>
            <Text style={styles.tipText}>• Verifica que tienes espacio suficiente</Text>
            <Text style={styles.tipText}>• Asegúrate de tener agua cerca</Text>
            <Text style={styles.tipText}>• Ajusta el volumen si usas música</Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 0,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  countdown: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    ...theme.typography.h1,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  exerciseLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  exerciseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  exerciseInfo: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  tipsContainer: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    backgroundColor: `${theme.colors.primary}05`,
    marginTop: theme.spacing.sm,
  },
  tipsTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
});