import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import {
  BLOCK_TYPES,
  EXERCISE_TYPES,
  formatDuration,
} from '../../models/routines';

export const DraggableExerciseBlock = ({
  block,
  index,
  onEdit,
  onDelete,
  onUpdateDuration,
  onUpdateReps,
  onUpdateSets,
  drag,
  isActive,
  style,
}) => {
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

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatExerciseDisplay = () => {
    if (block.exercise_type === EXERCISE_TYPES.REP_BASED) {
      return `${block.reps || 0} reps`;
    } else if (block.exercise_type === EXERCISE_TYPES.TIME_BASED) {
      return formatDuration(block.duration || 0);
    }
    return formatDuration(block.duration || 0);
  };

  const formatSetsDisplay = () => {
    const sets = block.sets || 1;
    if (sets === 1) return '';
    return ` × ${sets} sets`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isActive ? `${getBlockColor(block.type)}20` : theme.colors.surface },
        style,
      ]}
      onLongPress={drag}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Block Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.dragHandle}>
              <Text style={styles.dragIcon}>⋮⋮</Text>
            </View>
            <Text style={styles.blockIcon}>{getBlockIcon(block.type)}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {block.exercise_name || 'Sin nombre'}
              </Text>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.blockTypeBadge,
                    { backgroundColor: `${getBlockColor(block.type)}20` }
                  ]}
                >
                  <Text
                    style={[
                      styles.blockTypeText,
                      { color: getBlockColor(block.type) }
                    ]}
                  >
                    {block.type}
                  </Text>
                </View>
                {block.intensity && (
                  <View
                    style={[
                      styles.intensityBadge,
                      { backgroundColor: `${getIntensityColor(block.intensity)}20` }
                    ]}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        { color: getIntensityColor(block.intensity) }
                      ]}
                    >
                      {block.intensity}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Block Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit?.(index)}
              style={[styles.actionButton, styles.editButton]}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(index)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Details */}
        <View style={styles.details}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseDisplay}>
              {formatExerciseDisplay()}{formatSetsDisplay()}
            </Text>
            {block.rest_between_sets > 0 && block.sets > 1 && (
              <Text style={styles.restInfo}>
                Descanso entre series: {formatDuration(block.rest_between_sets)}
              </Text>
            )}
          </View>

          {/* Quick Edit Controls */}
          {block.type === BLOCK_TYPES.EXERCISE && (
            <View style={styles.quickControls}>
              {block.exercise_type === EXERCISE_TYPES.TIME_BASED ? (
                // Time controls
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Tiempo:</Text>
                  <View style={styles.controlButtons}>
                    <TouchableOpacity
                      onPress={() => onUpdateDuration?.(index, Math.max(5, (block.duration || 30) - 5))}
                      style={styles.controlButton}
                    >
                      <Text style={styles.controlButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>
                      {formatDuration(block.duration || 0)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onUpdateDuration?.(index, (block.duration || 30) + 5)}
                      style={styles.controlButton}
                    >
                      <Text style={styles.controlButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Reps controls
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Reps:</Text>
                  <View style={styles.controlButtons}>
                    <TouchableOpacity
                      onPress={() => onUpdateReps?.(index, Math.max(1, (block.reps || 10) - 1))}
                      style={styles.controlButton}
                    >
                      <Text style={styles.controlButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{block.reps || 0}</Text>
                    <TouchableOpacity
                      onPress={() => onUpdateReps?.(index, (block.reps || 10) + 1)}
                      style={styles.controlButton}
                    >
                      <Text style={styles.controlButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Sets controls */}
              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Sets:</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity
                    onPress={() => onUpdateSets?.(index, Math.max(1, (block.sets || 1) - 1))}
                    style={styles.controlButton}
                  >
                    <Text style={styles.controlButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.controlValue}>{block.sets || 1}</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateSets?.(index, (block.sets || 1) + 1)}
                    style={styles.controlButton}
                  >
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Set Group Details */}
          {block.type === BLOCK_TYPES.SET_GROUP && (
            <View style={styles.setGroupInfo}>
              <Text style={styles.setGroupText}>
                {block.exercises?.length || 0} ejercicios • {block.sets || 1} sets
              </Text>
              <Text style={styles.setGroupStructure}>
                Estructura: {block.structure_type || 'straight_set'}
              </Text>
            </View>
          )}

          {/* Notes */}
          {block.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>📝 {block.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  dragHandle: {
    width: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  dragIcon: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  blockIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  exerciseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  blockTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  blockTypeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 9,
    textTransform: 'capitalize',
  },
  intensityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  intensityText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.warning,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionIcon: {
    fontSize: 12,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  exerciseInfo: {
    marginBottom: theme.spacing.sm,
  },
  exerciseDisplay: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  restInfo: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  quickControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  controlGroup: {
    alignItems: 'center',
    flex: 1,
  },
  controlLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  controlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  controlValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  setGroupInfo: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  setGroupText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  setGroupStructure: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  notesContainer: {
    backgroundColor: `${theme.colors.warning}10`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  notesText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});