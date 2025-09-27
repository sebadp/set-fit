import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerDisplay, TimerControls, TimeInput } from '../components/timer';
import { Card, Button } from '../components/common';
import { theme } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';
import { useDatabase, useSettings } from '../hooks/useDatabase';
import { SettingsScreen } from './SettingsScreen';
import { RoutinesScreen } from './RoutinesScreen';
import { CreateRoutineScreen } from './CreateRoutineScreen';
import { WorkoutExecutionScreen } from './WorkoutExecutionScreen';
import { SETTING_KEYS } from '../constants/database';

export const TimerScreen = () => {
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutines, setShowRoutines] = useState(false);
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [showWorkoutExecution, setShowWorkoutExecution] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);

  // Database hooks
  const { isLoading, isReady, error } = useDatabase();
  const { getSetting } = useSettings();

  // Get default timer duration from settings
  const defaultDuration = getSetting(SETTING_KEYS.DEFAULT_TIMER_DURATION, 300);

  const {
    time,
    isActive,
    isPaused,
    isLastSeconds,
    isCompleted,
    start,
    pause,
    resume,
    stop,
    reset,
    setNewTime,
  } = useTimer(defaultDuration);

  const handleTimeSet = (newTime) => {
    setNewTime(newTime);
    setShowTimeInput(false);
  };

  const handlePlayPause = () => {
    if (isActive && !isPaused) {
      pause();
    } else {
      start();
    }
  };

  const getCurrentBlock = () => {
    if (isCompleted) return '¡Completado!';
    if (isActive && !isPaused) return 'Entrenando';
    if (isPaused) return 'En pausa';
    return 'Listo para entrenar';
  };

  // Navigation handlers
  const handlePlayRoutine = (routine) => {
    try {
      const blocks = JSON.parse(routine.blocks_json);
      if (blocks.length > 0) {
        // Start workout execution
        setWorkoutData({ routine, blocks });
        setShowRoutines(false);
        setShowWorkoutExecution(true);
      }
    } catch (error) {
      console.error('Error playing routine:', error);
    }
  };

  const handleStartWorkout = (routine, blocks) => {
    setWorkoutData({ routine, blocks });
    setShowRoutines(false);
    setShowWorkoutExecution(true);
  };

  const handleCreateRoutine = () => {
    setEditingRoutine(null);
    setShowRoutines(false);
    setShowCreateRoutine(true);
  };

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setShowRoutines(false);
    setShowCreateRoutine(true);
  };

  const handleRoutineSaved = () => {
    setShowCreateRoutine(false);
    setEditingRoutine(null);
    setShowRoutines(true);
  };

  // Show workout execution screen
  if (showWorkoutExecution && workoutData) {
    return (
      <WorkoutExecutionScreen
        route={{ params: workoutData }}
        navigation={{
          goBack: () => {
            setShowWorkoutExecution(false);
            setWorkoutData(null);
            setShowRoutines(true);
          },
          navigate: (screen) => {
            if (screen === 'Routines') {
              setShowWorkoutExecution(false);
              setWorkoutData(null);
              setShowRoutines(true);
            }
          },
        }}
      />
    );
  }

  // Show settings screen
  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  // Show routines screen
  if (showRoutines) {
    return (
      <RoutinesScreen
        onBack={() => setShowRoutines(false)}
        onCreateRoutine={handleCreateRoutine}
        onEditRoutine={handleEditRoutine}
        onPlayRoutine={handlePlayRoutine}
        onStartWorkout={handleStartWorkout}
      />
    );
  }

  // Show create routine screen
  if (showCreateRoutine) {
    return (
      <CreateRoutineScreen
        onBack={() => {
          setShowCreateRoutine(false);
          setEditingRoutine(null);
          setShowRoutines(true);
        }}
        onSave={handleRoutineSaved}
        onStartWorkout={handleStartWorkout}
        editingRoutine={editingRoutine}
      />
    );
  }

  // Database loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Inicializando SetFit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Database error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <Text style={styles.errorText}>Error al inicializar la base de datos</Text>
          <Button
            title="Reintentar"
            onPress={() => window.location.reload()}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerActions}>
            <Button
              title="🏃"
              onPress={() => setShowRoutines(true)}
              variant="ghost"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="⚙️"
              onPress={() => setShowSettings(true)}
              variant="ghost"
              size="small"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.mainContent}>
          <Card style={styles.timerCard}>
            <TimerDisplay
              time={time}
              isActive={isActive && !isPaused}
              isLastSeconds={isLastSeconds}
              currentBlock={getCurrentBlock()}
            />
          </Card>

          {/* Time Input (conditional) */}
          {showTimeInput && (
            <Card style={styles.inputCard}>
              <TimeInput
                onTimeSet={handleTimeSet}
                initialMinutes={Math.floor(time / 60)}
                initialSeconds={time % 60}
              />
            </Card>
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Controls */}
          <Card style={styles.controlsCard}>
            <TimerControls
              isActive={isActive}
              isPaused={isPaused}
              onPlay={handlePlayPause}
              onPause={pause}
              onStop={stop}
              onReset={reset}
            />
          </Card>

          {/* Config Time Button */}
          {!isActive && !isPaused && (
            <Card style={styles.configCard}>
              <Button
                title={showTimeInput ? 'Ocultar configuración' : 'Configurar tiempo'}
                onPress={() => setShowTimeInput(!showTimeInput)}
                variant="ghost"
              />
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  timerCard: {
    marginBottom: theme.spacing.lg,
    minHeight: 220,
    justifyContent: 'center',
  },
  inputCard: {
    marginTop: theme.spacing.lg,
  },
  bottomSection: {
    paddingBottom: theme.spacing.lg,
  },
  controlsCard: {
    marginBottom: theme.spacing.lg,
  },
  configCard: {
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
  },
});