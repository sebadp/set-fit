import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import {
  formatDuration,
  getDifficultyColor,
  getCategoryIcon,
  DIFFICULTY_LEVELS,
} from '../../models/routines';

export const RoutineCard = ({
  routine,
  onPress,
  onPlay,
  onEdit,
  onDuplicate,
  onDelete,
  showActions = true,
  style,
  ...props
}) => {
  const blocks = routine.blocks_json ? JSON.parse(routine.blocks_json) : [];
  const exerciseCount = blocks.filter(block => block.type === 'exercise').length;
  const difficultyColor = getDifficultyColor(routine.difficulty, theme);
  const categoryIcon = getCategoryIcon(routine.category);

  const formatLastUsed = (lastUsed) => {
    if (!lastUsed) return 'Nunca usado';

    const date = new Date(lastUsed);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Usado hoy';
    if (diffDays === 1) return 'Usado ayer';
    if (diffDays < 7) return `Usado hace ${diffDays} días`;
    if (diffDays < 30) return `Usado hace ${Math.floor(diffDays / 7)} semanas`;
    return `Usado hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} {...props}>
      <Card style={[styles.container, style]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {routine.name}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
                  <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                    {routine.difficulty}
                  </Text>
                </View>
                <Text style={styles.category}>
                  {routine.category}
                </Text>
              </View>
            </View>
          </View>

          {routine.is_template === 1 && (
            <View style={styles.templateBadge}>
              <Text style={styles.templateText}>Plantilla</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {routine.description && (
          <Text style={styles.description} numberOfLines={2}>
            {routine.description}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⏱️ {formatDuration(routine.total_duration)}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>🏃 {exerciseCount}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>📊 {routine.usage_count || 0}</Text>
            <Text style={styles.statLabel}>Usos</Text>
          </View>
        </View>

        {/* Last used */}
        <Text style={styles.lastUsed}>
          {formatLastUsed(routine.last_used)}
        </Text>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <Button
              title="▶️ Entrenar"
              onPress={() => onPlay?.(routine)}
              variant="primary"
              size="small"
              style={styles.playButton}
            />

            <View style={styles.secondaryActions}>
              {onEdit && (
                <Button
                  title="✏️"
                  onPress={() => onEdit(routine)}
                  variant="ghost"
                  size="small"
                  style={styles.iconButton}
                />
              )}

              {onDuplicate && (
                <Button
                  title="📋"
                  onPress={() => onDuplicate(routine)}
                  variant="ghost"
                  size="small"
                  style={styles.iconButton}
                />
              )}

              {onDelete && !routine.is_template && (
                <Button
                  title="🗑️"
                  onPress={() => onDelete(routine)}
                  variant="ghost"
                  size="small"
                  style={[styles.iconButton, styles.deleteButton]}
                />
              )}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  difficultyText: {
    ...theme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  templateBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  templateText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  lastUsed: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  playButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  iconButton: {
    minWidth: 36,
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
});