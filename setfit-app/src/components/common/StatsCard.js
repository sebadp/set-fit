import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { theme } from '../../constants/theme';

export const StatsCard = ({
  weeklyWorkouts = 0,
  totalTime = '0min',
  streak = 0,
  style
}) => {
  const stats = [
    {
      value: weeklyWorkouts,
      label: 'Esta semana',
      icon: '🏃',
      color: theme.colors.primary
    },
    {
      value: totalTime,
      label: 'Tiempo total',
      icon: '⏰',
      color: theme.colors.secondary
    },
    {
      value: `${streak} días`,
      label: 'Racha',
      icon: '🔥',
      color: theme.colors.success
    }
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Tu progreso semanal</Text>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    ...theme.typography.h2,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});