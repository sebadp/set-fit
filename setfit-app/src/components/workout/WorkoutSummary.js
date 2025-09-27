import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import { BLOCK_TYPES, EXERCISE_TYPES, formatDuration } from '../../models/routines';

const { width: screenWidth } = Dimensions.get('window');

export const WorkoutSummary = ({
  workoutSession,
  blocks = [],
  completedBlocks = [],
  skippedBlocks = [],
  totalElapsedTime = 0,
  pauseTimestamps = [],
  onSaveAndContinue,
  onShareResults,
  onStartNewWorkout,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Celebration animation
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const calculateStats = () => {
    const totalBlocks = blocks.length;
    const completedCount = completedBlocks.length;
    const skippedCount = skippedBlocks.length;
    const completionRate = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0;

    const exerciseBlocks = blocks.filter(block => block.type === BLOCK_TYPES.EXERCISE);
    const completedExercises = completedBlocks.filter(block => block.type === BLOCK_TYPES.EXERCISE);

    const totalSets = exerciseBlocks.reduce((sum, block) => sum + (block.sets || 1), 0);
    const completedSets = completedExercises.reduce((sum, block) => sum + (block.sets || 1), 0);

    // Calculate pause time
    const totalPauseTime = pauseTimestamps.reduce((total, pause) => {
      if (pause.pausedAt && pause.resumedAt) {
        const pauseDuration = new Date(pause.resumedAt) - new Date(pause.pausedAt);
        return total + Math.floor(pauseDuration / 1000);
      }
      return total;
    }, 0);

    const activeWorkoutTime = totalElapsedTime - totalPauseTime;

    return {
      totalBlocks,
      completedCount,
      skippedCount,
      completionRate,
      totalSets,
      completedSets,
      activeWorkoutTime,
      totalPauseTime,
      pauseCount: pauseTimestamps.length,
    };
  };

  const stats = calculateStats();

  const getCompletionMessage = () => {
    if (stats.completionRate === 100) {
      return {
        title: '🎉 ¡Entrenamiento Completado!',
        subtitle: 'Felicitaciones, completaste toda la rutina',
        color: theme.colors.success,
      };
    } else if (stats.completionRate >= 75) {
      return {
        title: '🌟 ¡Excelente Trabajo!',
        subtitle: 'Completaste la mayoría de la rutina',
        color: theme.colors.primary,
      };
    } else if (stats.completionRate >= 50) {
      return {
        title: '💪 ¡Buen Esfuerzo!',
        subtitle: 'Completaste una buena parte de la rutina',
        color: theme.colors.warning,
      };
    } else {
      return {
        title: '👍 ¡Algo es Mejor que Nada!',
        subtitle: 'Todo progreso cuenta, sigue así',
        color: theme.colors.info,
      };
    }
  };

  const completionMessage = getCompletionMessage();

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: theme.colors.success }]}>
          {stats.completedCount}
        </Text>
        <Text style={styles.statLabel}>Completados</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: theme.colors.warning }]}>
          {stats.skippedCount}
        </Text>
        <Text style={styles.statLabel}>Saltados</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: theme.colors.primary }]}>
          {Math.round(stats.completionRate)}%
        </Text>
        <Text style={styles.statLabel}>Completado</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: theme.colors.info }]}>
          {stats.completedSets}
        </Text>
        <Text style={styles.statLabel}>Series</Text>
      </View>
    </View>
  );

  const renderTimeStats = () => (
    <View style={styles.timeStats}>
      <View style={styles.timeStatRow}>
        <Text style={styles.timeLabel}>⏱️ Tiempo Total:</Text>
        <Text style={styles.timeValue}>{formatDuration(totalElapsedTime)}</Text>
      </View>
      <View style={styles.timeStatRow}>
        <Text style={styles.timeLabel}>🔥 Tiempo Activo:</Text>
        <Text style={styles.timeValue}>{formatDuration(stats.activeWorkoutTime)}</Text>
      </View>
      {stats.totalPauseTime > 0 && (
        <View style={styles.timeStatRow}>
          <Text style={styles.timeLabel}>⏸️ Tiempo en Pausa:</Text>
          <Text style={styles.timeValue}>{formatDuration(stats.totalPauseTime)}</Text>
        </View>
      )}
      {stats.pauseCount > 0 && (
        <View style={styles.timeStatRow}>
          <Text style={styles.timeLabel}>🔄 Pausas:</Text>
          <Text style={styles.timeValue}>{stats.pauseCount} veces</Text>
        </View>
      )}
    </View>
  );

  const renderCompletedExercises = () => {
    if (completedBlocks.length === 0) return null;

    return (
      <View style={styles.exercisesList}>
        <Text style={styles.exercisesTitle}>✅ Ejercicios Completados</Text>
        {completedBlocks
          .filter(block => block.type === BLOCK_TYPES.EXERCISE)
          .map((block, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseIcon}>
                <Text style={styles.exerciseIconText}>✓</Text>
              </View>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseName}>{block.exercise_name}</Text>
                <Text style={styles.exerciseInfo}>
                  {block.sets || 1} series • {' '}
                  {block.exercise_type === EXERCISE_TYPES.REP_BASED
                    ? `${block.reps || 0} reps`
                    : formatDuration(block.duration || 0)
                  }
                </Text>
              </View>
            </View>
          ))}
      </View>
    );
  };

  const renderSkippedExercises = () => {
    if (skippedBlocks.length === 0) return null;

    return (
      <View style={styles.exercisesList}>
        <Text style={styles.exercisesTitle}>⏭️ Ejercicios Saltados</Text>
        {skippedBlocks
          .filter(block => block.type === BLOCK_TYPES.EXERCISE)
          .map((block, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={[styles.exerciseIcon, { backgroundColor: theme.colors.warning }]}>
                <Text style={styles.exerciseIconText}>⏭️</Text>
              </View>
              <View style={styles.exerciseDetails}>
                <Text style={[styles.exerciseName, { opacity: 0.7 }]}>
                  {block.exercise_name}
                </Text>
                <Text style={styles.exerciseInfo}>
                  {block.sets || 1} series • {' '}
                  {block.exercise_type === EXERCISE_TYPES.REP_BASED
                    ? `${block.reps || 0} reps`
                    : formatDuration(block.duration || 0)
                  }
                </Text>
              </View>
            </View>
          ))}
      </View>
    );
  };

  const renderAchievements = () => {
    const achievements = [];

    if (stats.completionRate === 100) {
      achievements.push({ icon: '🏆', text: 'Rutina Perfecta' });
    }
    if (stats.activeWorkoutTime >= 1800) { // 30 minutes
      achievements.push({ icon: '⏰', text: 'Entrenamiento Extenso' });
    }
    if (stats.pauseCount === 0) {
      achievements.push({ icon: '🔥', text: 'Sin Pausas' });
    }
    if (stats.completedSets >= 20) {
      achievements.push({ icon: '💪', text: 'Súper Series' });
    }
    if (skippedBlocks.length === 0) {
      achievements.push({ icon: '✨', text: 'Sin Saltos' });
    }

    if (achievements.length === 0) return null;

    return (
      <View style={styles.achievements}>
        <Text style={styles.achievementsTitle}>🏅 Logros Obtenidos</Text>
        <View style={styles.achievementsList}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementText}>{achievement.text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: `${completionMessage.color}15` }]}>
            <Text style={styles.title}>{completionMessage.title}</Text>
            <Text style={styles.subtitle}>{completionMessage.subtitle}</Text>
            {workoutSession?.routineName && (
              <Text style={styles.routineName}>📋 {workoutSession.routineName}</Text>
            )}
          </View>

          {/* Stats Grid */}
          {renderStatsGrid()}

          {/* Time Stats */}
          {renderTimeStats()}

          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Progreso General</Text>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>
                {Math.round(stats.completionRate)}%
              </Text>
              <Text style={styles.progressLabel}>Completado</Text>
            </View>
          </View>

          {/* Achievements */}
          {renderAchievements()}

          {/* Exercise Lists */}
          {renderCompletedExercises()}
          {renderSkippedExercises()}

          {/* Motivational Message */}
          <View style={styles.motivationSection}>
            <Text style={styles.motivationTitle}>💬 Mensaje Motivacional</Text>
            <Text style={styles.motivationText}>
              {stats.completionRate === 100
                ? '¡Increíble! Has completado toda la rutina. Tu dedicación y esfuerzo son admirables. ¡Sigue así!'
                : stats.completionRate >= 75
                ? '¡Excelente trabajo! Has mostrado gran determinación. Cada sesión te acerca más a tus objetivos.'
                : '¡Bien hecho! Cada paso cuenta en tu camino fitness. La constancia es la clave del éxito.'
              }
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="💾 Guardar y Continuar"
            onPress={onSaveAndContinue}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />

          {onShareResults && (
            <Button
              title="📤 Compartir Resultados"
              onPress={onShareResults}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          )}

          <Button
            title="🔄 Nuevo Entrenamiento"
            onPress={onStartNewWorkout}
            variant="ghost"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: theme.spacing.md,
    padding: 0,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  routineName: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  timeStats: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    gap: theme.spacing.sm,
  },
  timeStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  timeLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  timeValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  progressSection: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  progressTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    borderWidth: 8,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  progressLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  achievements: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  achievementsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  achievementsList: {
    gap: theme.spacing.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  exercisesList: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  exercisesTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  exerciseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIconText: {
    color: theme.colors.background,
    fontSize: 16,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  exerciseInfo: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  motivationSection: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  motivationTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  motivationText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});