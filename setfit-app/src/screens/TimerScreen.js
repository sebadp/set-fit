import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerDisplay, TimerControls, TimeInput } from '../components/timer';
import { Card, Button } from '../components/common';
import { theme } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';
import { useDatabase, useSettings } from '../hooks/useDatabase';
import { SettingsScreen } from './SettingsScreen';
import { SETTING_KEYS } from '../constants/database';

export const TimerScreen = () => {
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Show settings screen
  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
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
          <Button
            title="⚙️"
            onPress={() => setShowSettings(true)}
            variant="ghost"
            size="small"
            style={styles.settingsButton}
          />
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
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  settingsButton: {
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