import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { theme } from '../../constants/theme';
import { createShadow } from '../../utils/platformStyles';
import {
  BLOCK_TYPES,
  EXERCISE_TYPES,
  calculateRoutineDuration,
  formatDuration,
} from '../../models/routines';

export const RoutinePreview = ({
  routine,
  blocks = [],
  onStartWorkout,
  style,
}) => {
  const totalDuration = calculateRoutineDuration(blocks);
  const exerciseBlocks = blocks.filter(block => block.type === BLOCK_TYPES.EXERCISE);
  const restBlocks = blocks.filter(block => block.type === BLOCK_TYPES.REST);
  const setGroups = blocks.filter(block => block.type === BLOCK_TYPES.SET_GROUP);

  const getBlockIcon = (type) => {
    switch (type) {
      case BLOCK_TYPES.EXERCISE:
        return '🏃';
      case BLOCK_TYPES.REST:
        return '⏸️';
      case BLOCK_TYPES.PREPARATION:
        return '🏁';
      case BLOCK_TYPES.SET_GROUP:
        return '🔄';
      default:
        return '▶️';
    }
  };

  const getBlockColor = (type) => {
    switch (type) {
      case BLOCK_TYPES.EXERCISE:
        return theme.colors.primary;
      case BLOCK_TYPES.REST:
        return theme.colors.warning;
      case BLOCK_TYPES.PREPARATION:
        return theme.colors.success;
      case BLOCK_TYPES.SET_GROUP:
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const calculateIntensityDistribution = () => {
    const intensities = { low: 0, medium: 0, high: 0 };
    exerciseBlocks.forEach(block => {
      if (block.intensity) {
        intensities[block.intensity]++;
      } else {
        intensities.medium++; // Default to medium
      }
    });
    return intensities;
  };

  const intensityDistribution = calculateIntensityDistribution();
  const totalExercises = exerciseBlocks.length;

  const renderTimelineBlock = (block, index) => {
    const blockDuration = block.exercise_type === EXERCISE_TYPES.TIME_BASED
      ? (block.duration || 0) * (block.sets || 1)
      : Math.max((block.reps || 0) * 2, 15) * (block.sets || 1);

    // Add rest between sets
    const restTime = block.sets > 1 ? (block.rest_between_sets || 0) * (block.sets - 1) : 0;
    const totalBlockTime = blockDuration + restTime;

    return (
      <View key={index} style={styles.timelineBlock}>
        <View style={styles.timelineConnector}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: getBlockColor(block.type) }
            ]}
          >
            <Text style={styles.timelineIcon}>{getBlockIcon(block.type)}</Text>
          </View>
          {index < blocks.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{block.exercise_name}</Text>
          <View style={styles.timelineDetails}>
            {block.exercise_type === EXERCISE_TYPES.REP_BASED ? (
              <Text style={styles.timelineDetail}>
                {block.reps} reps × {block.sets} sets
              </Text>
            ) : (
              <Text style={styles.timelineDetail}>
                {formatDuration(block.duration)} × {block.sets} sets
              </Text>
            )}
            <Text style={styles.timelineDuration}>
              ⏱️ {formatDuration(totalBlockTime)}
            </Text>
          </View>
          {block.notes && (
            <Text style={styles.timelineNotes}>📝 {block.notes}</Text>
          )}
        </View>
      </View>
    );
  };

  if (blocks.length === 0) {
    return (
      <Card style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>🎯 Vista Previa Vacía</Text>
          <Text style={styles.emptyDescription}>
            Agrega bloques a tu rutina para ver la vista previa y estimación de tiempo.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vista Previa</Text>
          <Text style={styles.routineName}>{routine?.name || 'Nueva Rutina'}</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Resumen</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>⏱️ {formatDuration(totalDuration)}</Text>
              <Text style={styles.statLabel}>Tiempo Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>🏃 {exerciseBlocks.length}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>⏸️ {restBlocks.length}</Text>
              <Text style={styles.statLabel}>Descansos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>🔄 {setGroups.length}</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
          </View>
        </View>

        {/* Intensity Distribution */}
        {totalExercises > 0 && (
          <View style={styles.intensitySection}>
            <Text style={styles.sectionTitle}>🔥 Distribución de Intensidad</Text>
            <View style={styles.intensityBars}>
              <View style={styles.intensityBar}>
                <Text style={styles.intensityLabel}>Baja</Text>
                <View style={styles.intensityBarContainer}>
                  <View
                    style={[
                      styles.intensityBarFill,
                      {
                        width: `${(intensityDistribution.low / totalExercises) * 100}%`,
                        backgroundColor: theme.colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.intensityCount}>{intensityDistribution.low}</Text>
              </View>
              <View style={styles.intensityBar}>
                <Text style={styles.intensityLabel}>Media</Text>
                <View style={styles.intensityBarContainer}>
                  <View
                    style={[
                      styles.intensityBarFill,
                      {
                        width: `${(intensityDistribution.medium / totalExercises) * 100}%`,
                        backgroundColor: theme.colors.warning,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.intensityCount}>{intensityDistribution.medium}</Text>
              </View>
              <View style={styles.intensityBar}>
                <Text style={styles.intensityLabel}>Alta</Text>
                <View style={styles.intensityBarContainer}>
                  <View
                    style={[
                      styles.intensityBarFill,
                      {
                        width: `${(intensityDistribution.high / totalExercises) * 100}%`,
                        backgroundColor: theme.colors.error,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.intensityCount}>{intensityDistribution.high}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>🗓️ Cronología del Entrenamiento</Text>
          <View style={styles.timeline}>
            {blocks.map((block, index) => renderTimelineBlock(block, index))}
          </View>
        </View>

        {/* Start Workout Button */}
        {onStartWorkout && blocks.length > 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => onStartWorkout(routine, blocks)}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>🚀 Comenzar Entrenamiento</Text>
            <Text style={styles.startButtonSubtext}>
              {formatDuration(totalDuration)} • {exerciseBlocks.length} ejercicios
            </Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Antes de empezar:</Text>
          <Text style={styles.tipText}>• Asegúrate de tener espacio suficiente</Text>
          <Text style={styles.tipText}>• Ten agua cerca para hidratarte</Text>
          <Text style={styles.tipText}>• Realiza un calentamiento previo</Text>
          <Text style={styles.tipText}>• Escucha a tu cuerpo y adapta la intensidad</Text>
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  routineName: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  summarySection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minWidth: '22%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  intensitySection: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  intensityBars: {
    gap: theme.spacing.sm,
  },
  intensityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  intensityLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    minWidth: 40,
  },
  intensityBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  intensityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  intensityCount: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  timelineSection: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  timeline: {
    paddingLeft: theme.spacing.sm,
  },
  timelineBlock: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  timelineIcon: {
    fontSize: 16,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  timelineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  timelineDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  timelineDuration: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  timelineNotes: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    alignItems: 'center',
    ...createShadow({ offsetY: 4, blurRadius: 20, opacity: 0.3, elevation: 6 }),
  },
  startButtonText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  startButtonSubtext: {
    ...theme.typography.caption,
    color: theme.colors.text,
    opacity: 0.8,
  },
  tipsSection: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
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
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
