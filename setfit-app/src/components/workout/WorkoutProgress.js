import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Card } from '../common';
import { theme } from '../../constants/theme';
import { BLOCK_TYPES, formatDuration } from '../../models/routines';

const { width: screenWidth } = Dimensions.get('window');

export const WorkoutProgress = ({
  progress,
  blocks = [],
  currentBlockIndex = 0,
  currentSet = 1,
  totalElapsedTime = 0,
  estimatedTotalTime = 0,
  style,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress.percent || 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for active indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [progress.percent]);

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

  const getBlockColor = (type, isActive = false, isCompleted = false) => {
    if (isCompleted) return theme.colors.success;
    if (isActive) return theme.colors.primary;

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

  const renderMainProgress = () => (
    <View style={styles.mainProgress}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Progreso del Entrenamiento</Text>
        <Text style={styles.progressStats}>
          {progress.completed} / {progress.total} series completadas
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(progress.percent || 0)}%
        </Text>
      </View>

      <View style={styles.timeStats}>
        <View style={styles.timeStat}>
          <Text style={styles.timeValue}>{formatDuration(totalElapsedTime)}</Text>
          <Text style={styles.timeLabel}>Tiempo Transcurrido</Text>
        </View>
        {estimatedTotalTime > 0 && (
          <View style={styles.timeStat}>
            <Text style={styles.timeValue}>
              {formatDuration(Math.max(0, estimatedTotalTime - totalElapsedTime))}
            </Text>
            <Text style={styles.timeLabel}>Tiempo Restante</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderBlockTimeline = () => {
    const visibleBlocks = blocks.slice(
      Math.max(0, currentBlockIndex - 2),
      Math.min(blocks.length, currentBlockIndex + 4)
    );

    return (
      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>Cronología</Text>
        <View style={styles.timelineContainer}>
          {visibleBlocks.map((block, index) => {
            const actualIndex = Math.max(0, currentBlockIndex - 2) + index;
            const isActive = actualIndex === currentBlockIndex;
            const isCompleted = actualIndex < currentBlockIndex;
            const isPending = actualIndex > currentBlockIndex;

            return (
              <View key={actualIndex} style={styles.timelineItem}>
                <Animated.View
                  style={[
                    styles.timelineIndicator,
                    {
                      backgroundColor: getBlockColor(block.type, isActive, isCompleted),
                      transform: isActive ? [{ scale: pulseAnim }] : [{ scale: 1 }],
                    },
                  ]}
                >
                  <Text style={styles.timelineIcon}>
                    {isCompleted ? '✓' : getBlockIcon(block.type)}
                  </Text>
                </Animated.View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineName,
                      isActive && styles.timelineNameActive,
                      isCompleted && styles.timelineNameCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {block.exercise_name || 'Ejercicio'}
                  </Text>
                  {isActive && block.sets > 1 && (
                    <Text style={styles.timelineSetInfo}>
                      Serie {currentSet} de {block.sets}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{progress.currentBlock}</Text>
        <Text style={styles.statLabel}>Ejercicio</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{currentSet}</Text>
        <Text style={styles.statLabel}>Serie</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{blocks.length}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
    </View>
  );

  const renderMiniProgressCircles = () => {
    const maxVisibleBlocks = 8;
    const visibleBlocks = blocks.length > maxVisibleBlocks
      ? blocks.slice(0, maxVisibleBlocks)
      : blocks;

    return (
      <View style={styles.miniProgress}>
        <Text style={styles.miniProgressTitle}>Vista Rápida</Text>
        <View style={styles.progressCircles}>
          {visibleBlocks.map((block, index) => {
            const isCompleted = index < currentBlockIndex;
            const isActive = index === currentBlockIndex;
            const progress = isCompleted ? 100 : (isActive ? (currentSet / (block.sets || 1)) * 100 : 0);

            return (
              <View key={index} style={styles.circleContainer}>
                <View
                  style={[
                    styles.progressCircle,
                    { borderColor: getBlockColor(block.type, isActive, isCompleted) },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.progressCircleFill,
                      {
                        backgroundColor: getBlockColor(block.type, isActive, isCompleted),
                        transform: [
                          {
                            rotate: `${(progress / 100) * 360}deg`,
                          },
                        ],
                      },
                    ]}
                  />
                  <View style={styles.progressCircleInner}>
                    <Text style={styles.progressCircleText}>
                      {isCompleted ? '✓' : getBlockIcon(block.type)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
          {blocks.length > maxVisibleBlocks && (
            <View style={styles.moreIndicator}>
              <Text style={styles.moreText}>+{blocks.length - maxVisibleBlocks}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.card}>
        {renderMainProgress()}
        {renderQuickStats()}
        {renderBlockTimeline()}
        {renderMiniProgressCircles()}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    padding: theme.spacing.lg,
  },
  mainProgress: {
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    marginBottom: theme.spacing.md,
  },
  progressTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressStats: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.md,
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
  progressPercentage: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeStat: {
    alignItems: 'center',
  },
  timeValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  timeLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  timeline: {
    marginBottom: theme.spacing.lg,
  },
  timelineTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  timelineContainer: {
    gap: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  timelineIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIcon: {
    fontSize: 14,
    color: theme.colors.background,
  },
  timelineContent: {
    flex: 1,
  },
  timelineName: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  timelineNameActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  timelineNameCompleted: {
    color: theme.colors.success,
    textDecorationLine: 'line-through',
  },
  timelineSetInfo: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  miniProgress: {
    alignItems: 'center',
  },
  miniProgressTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  progressCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  circleContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  progressCircleFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    transformOrigin: '100% 50%',
  },
  progressCircleInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleText: {
    fontSize: 8,
  },
  moreIndicator: {
    marginLeft: theme.spacing.xs,
  },
  moreText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
  },
});