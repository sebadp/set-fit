import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QuickActionCard } from '../../components/common/QuickActionCard';
import { Card } from '../../components/common';
import { theme } from '../../constants/theme';
import { useDatabase } from '../../hooks/useDatabase';

export const QuickStartScreen = ({ navigation, route }) => {
  const [recentRoutines, setRecentRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { db, isReady } = useDatabase();
  const mode = route?.params?.mode;

  useEffect(() => {
    if (isReady) {
      loadRecentRoutines();
    }
  }, [isReady]);

  const loadRecentRoutines = async () => {
    try {
      if (!db) return;

      const routines = await db.getAllAsync(`
        SELECT r.*, COUNT(ws.id) as usage_count
        FROM routines r
        LEFT JOIN workout_sessions ws ON r.id = ws.routine_id
        WHERE r.user_id = 1 OR r.is_template = 1
        GROUP BY r.id
        ORDER BY r.last_used DESC, usage_count DESC
        LIMIT 5
      `);

      setRecentRoutines(routines || []);
    } catch (error) {
      console.log('Error loading recent routines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickWorkouts = [
    {
      title: 'Rápido 5 min',
      subtitle: 'Calentamiento ligero',
      duration: 300,
      icon: '⚡',
      blocks: [
        { name: 'Saltos de tijera', duration: 60, sets: 1, exercise_type: 'time_based' },
        { name: 'Flexiones', duration: 30, sets: 2, exercise_type: 'time_based', rest_between_sets: 10 },
        { name: 'Plancha', duration: 45, sets: 2, exercise_type: 'time_based', rest_between_sets: 15 },
        { name: 'Sentadillas', duration: 45, sets: 2, exercise_type: 'time_based', rest_between_sets: 15 },
      ]
    },
    {
      title: 'Intenso 10 min',
      subtitle: 'Cardio y fuerza',
      duration: 600,
      icon: '🔥',
      blocks: [
        { name: 'Calentamiento', duration: 60, sets: 1, exercise_type: 'time_based' },
        { name: 'Burpees', duration: 45, sets: 3, exercise_type: 'time_based', rest_between_sets: 15 },
        { name: 'Mountain climbers', duration: 45, sets: 3, exercise_type: 'time_based', rest_between_sets: 15 },
        { name: 'Flexiones', duration: 30, sets: 3, exercise_type: 'time_based', rest_between_sets: 10 },
        { name: 'Plancha lateral', duration: 30, sets: 2, exercise_type: 'time_based', rest_between_sets: 10 },
        { name: 'Estiramiento', duration: 90, sets: 1, exercise_type: 'time_based' },
      ]
    },
    {
      title: 'Completo 15 min',
      subtitle: 'Entrenamiento full body',
      duration: 900,
      icon: '💪',
      blocks: [
        { name: 'Calentamiento dinámico', duration: 120, sets: 1, exercise_type: 'time_based' },
        { name: 'Sentadillas', duration: 45, sets: 3, exercise_type: 'time_based', rest_between_sets: 20 },
        { name: 'Flexiones', duration: 45, sets: 3, exercise_type: 'time_based', rest_between_sets: 20 },
        { name: 'Plancha', duration: 60, sets: 2, exercise_type: 'time_based', rest_between_sets: 30 },
        { name: 'Lunges', duration: 45, sets: 3, exercise_type: 'time_based', rest_between_sets: 20 },
        { name: 'Burpees', duration: 30, sets: 3, exercise_type: 'time_based', rest_between_sets: 30 },
        { name: 'Core twists', duration: 45, sets: 2, exercise_type: 'time_based', rest_between_sets: 15 },
        { name: 'Estiramiento', duration: 180, sets: 1, exercise_type: 'time_based' },
      ]
    }
  ];

  const handleStartQuickWorkout = (workout) => {
    const routine = {
      id: null,
      name: workout.title,
      description: workout.subtitle,
      category: 'quick',
      difficulty: 'beginner',
      total_duration: workout.duration,
    };

    // Navigate to WorkoutExecution
    navigation.navigate('WorkoutExecution', {
      routine,
      blocks: workout.blocks
    });
  };

  const handleStartRoutine = (routine) => {
    try {
      const blocks = JSON.parse(routine.blocks_json || '[]');
      if (blocks.length === 0) {
        Alert.alert('Error', 'Esta rutina no tiene ejercicios configurados');
        return;
      }

      navigation.navigate('WorkoutExecution', {
        routine,
        blocks
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la rutina');
    }
  };

  const handleCreateNewRoutine = () => {
    navigation.navigate('Routines', {
      screen: 'CreateRoutine'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>¡Hora de entrenar! 🔥</Text>
          <Text style={styles.subtitle}>
            Elige cómo quieres empezar tu entrenamiento
          </Text>
        </View>

        {/* Quick Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrenamientos rápidos</Text>
          <Text style={styles.sectionSubtitle}>Listos para empezar ahora mismo</Text>

          {quickWorkouts.map((workout, index) => (
            <QuickActionCard
              key={index}
              title={workout.title}
              subtitle={workout.subtitle}
              icon={workout.icon}
              variant={index === 0 ? 'success' : index === 1 ? 'primary' : 'secondary'}
              onPress={() => handleStartQuickWorkout(workout)}
              style={styles.workoutCard}
            />
          ))}
        </View>

        {/* Recent Routines */}
        {recentRoutines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rutinas recientes</Text>
            <Text style={styles.sectionSubtitle}>Continúa donde lo dejaste</Text>

            {recentRoutines.slice(0, 3).map((routine, index) => (
              <Card key={routine.id} style={styles.routineCard}>
                <TouchableOpacity
                  style={styles.routineContent}
                  onPress={() => handleStartRoutine(routine)}
                >
                  <View style={styles.routineInfo}>
                    <View style={styles.routineHeader}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineDuration}>
                        {formatDuration(routine.total_duration || 0)}
                      </Text>
                    </View>
                    <Text style={styles.routineDescription}>
                      {routine.description || 'Sin descripción'}
                    </Text>
                    <View style={styles.routineMeta}>
                      <Text style={styles.routineCategory}>
                        📂 {routine.category || 'General'}
                      </Text>
                      <Text style={styles.routineDifficulty}>
                        🎯 {routine.difficulty || 'Principiante'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.routineAction}>
                    <Text style={styles.playIcon}>▶️</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Routines')}
            >
              <Text style={styles.viewAllText}>Ver todas las rutinas</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create New Routine */}
        <Card style={styles.createCard}>
          <TouchableOpacity
            style={styles.createContent}
            onPress={handleCreateNewRoutine}
          >
            <View style={styles.createIcon}>
              <Text style={styles.createIconText}>✏️</Text>
            </View>
            <View style={styles.createInfo}>
              <Text style={styles.createTitle}>Crear rutina personalizada</Text>
              <Text style={styles.createSubtitle}>
                Diseña tu propio entrenamiento desde cero
              </Text>
            </View>
          </TouchableOpacity>
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
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  workoutCard: {
    marginVertical: theme.spacing.sm,
  },
  routineCard: {
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  routineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineInfo: {
    flex: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routineName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  routineDuration: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  routineDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  routineMeta: {
    flexDirection: 'row',
  },
  routineCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  routineDifficulty: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  routineAction: {
    padding: theme.spacing.sm,
  },
  playIcon: {
    fontSize: 20,
  },
  viewAllButton: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  viewAllText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  createCard: {
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  createContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  createIconText: {
    fontSize: 24,
  },
  createInfo: {
    flex: 1,
  },
  createTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  createSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  bottomSpacing: {
    height: 20,
  },
});