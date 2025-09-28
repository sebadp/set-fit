import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QuickActionCard } from '../../components/common/QuickActionCard';
import { StatsCard } from '../../components/common/StatsCard';
import { Card } from '../../components/common';
import { theme } from '../../constants/theme';
import { useDatabase, useSettings } from '../../hooks/useDatabase';
import { SETTING_KEYS } from '../../constants/database';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [weeklyStats, setWeeklyStats] = useState({
    workouts: 0,
    totalTime: '0min',
    streak: 0
  });

  const { db, isReady } = useDatabase();
  const { getSetting } = useSettings();

  useEffect(() => {
    if (isReady) {
      loadUserData();
      loadWeeklyStats();
    }
  }, [isReady]);

  const loadUserData = async () => {
    try {
      // Get user name from settings or database
      const savedName = getSetting(SETTING_KEYS.USER_NAME, 'Usuario');
      setUserName(savedName);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      if (!db) return;

      // Get stats for current week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weeklyWorkouts = await db.getAllAsync(
        'SELECT COUNT(*) as count FROM workout_sessions WHERE created_at >= ? AND completed = 1',
        [weekStart.toISOString()]
      );

      const totalTimeResult = await db.getAllAsync(
        'SELECT SUM(duration) as total FROM workout_sessions WHERE created_at >= ? AND completed = 1',
        [weekStart.toISOString()]
      );

      const workoutCount = weeklyWorkouts[0]?.count || 0;
      const totalTimeSeconds = totalTimeResult[0]?.total || 0;
      const totalTimeFormatted = formatTime(totalTimeSeconds);

      // Calculate streak (simplified)
      const streak = workoutCount > 0 ? Math.min(workoutCount, 7) : 0;

      setWeeklyStats({
        workouts: workoutCount,
        totalTime: totalTimeFormatted,
        streak
      });
    } catch (error) {
      console.log('Error loading weekly stats:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadWeeklyStats()]);
    setRefreshing(false);
  };

  const getMotivationalMessage = () => {
    const messages = [
      '¡Es hora de entrenar! 💪',
      '¡Tu cuerpo te lo agradecerá! ✨',
      '¡Cada movimiento cuenta! 🔥',
      '¡Hoy es un gran día para entrenar! 🌟',
      '¡Vamos por ese entrenamiento! 🚀'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleContinueLastWorkout = () => {
    // Navigate to last used routine or quick workout
    navigation.navigate('QuickStart');
  };

  const handleQuickWorkout = () => {
    navigation.navigate('QuickStart', { mode: 'quick' });
  };

  const handleViewRoutines = () => {
    navigation.navigate('Routines');
  };

  const handleCreateRoutine = () => {
    navigation.navigate('Routines', {
      screen: 'CreateRoutine'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting Section */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>¡Hola, {userName}! 👋</Text>
          <Text style={styles.subGreeting}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>

          <QuickActionCard
            title="Continuar entrenando"
            subtitle="Retoma donde lo dejaste"
            icon="▶️"
            variant="primary"
            onPress={handleContinueLastWorkout}
          />

          <QuickActionCard
            title="Entrenamiento rápido"
            subtitle="5, 10 o 15 minutos"
            icon="⚡"
            variant="secondary"
            onPress={handleQuickWorkout}
          />
        </View>

        {/* Stats Card */}
        <StatsCard
          weeklyWorkouts={weeklyStats.workouts}
          totalTime={weeklyStats.totalTime}
          streak={weeklyStats.streak}
        />

        {/* Secondary Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestionar entrenamientos</Text>

          <View style={styles.secondaryActions}>
            <Card style={[styles.secondaryCard, { marginRight: theme.spacing.sm }]}>
              <TouchableOpacity onPress={handleViewRoutines} style={styles.secondaryAction}>
                <Text style={styles.secondaryIcon}>📋</Text>
                <Text style={styles.secondaryTitle}>Mis Rutinas</Text>
                <Text style={styles.secondarySubtitle}>Ver y editar</Text>
              </TouchableOpacity>
            </Card>

            <Card style={[styles.secondaryCard, { marginLeft: theme.spacing.sm }]}>
              <TouchableOpacity onPress={handleCreateRoutine} style={styles.secondaryAction}>
                <Text style={styles.secondaryIcon}>✏️</Text>
                <Text style={styles.secondaryTitle}>Crear Nueva</Text>
                <Text style={styles.secondarySubtitle}>Rutina personalizada</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>

        {/* Tips Section */}
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Consejo del día</Text>
          </View>
          <Text style={styles.tipText}>
            La consistencia es clave. Mejor 10 minutos diarios que 2 horas una vez por semana.
          </Text>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  greeting: {
    marginBottom: theme.spacing.xl,
  },
  greetingText: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  subGreeting: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  secondaryCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  secondaryAction: {
    alignItems: 'center',
  },
  secondaryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  secondaryTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  secondarySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: `${theme.colors.success}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  tipTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tipText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});