import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { stateColors } from '../../constants/colors';

export const TimerDisplay = ({
  time,
  isActive = false,
  isLastSeconds = false,
  currentBlock = 'Preparándote'
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDisplayColor = () => {
    if (isLastSeconds) return stateColors.lastSeconds;
    if (isActive) return stateColors.exerciseActive;
    return theme.colors.text;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.timeText, { color: getDisplayColor() }]}>
        {formatTime(time)}
      </Text>
      <Text style={styles.blockText}>{currentBlock}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  timeText: {
    ...theme.typography.timer,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  blockText: {
    ...theme.typography.h2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});