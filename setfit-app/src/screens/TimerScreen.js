import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerDisplay, TimerControls, TimeInput } from '../components/timer';
import { Card, Button } from '../components/common';
import { theme } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';

export const TimerScreen = () => {
  const [showTimeInput, setShowTimeInput] = useState(false);
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
  } = useTimer(300); // 5 minutos por defecto

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con logo */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Timer Display */}
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
      </ScrollView>
    </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  timerCard: {
    marginBottom: theme.spacing.lg,
    minHeight: 200,
    justifyContent: 'center',
  },
  inputCard: {
    marginBottom: theme.spacing.lg,
  },
  controlsCard: {
    marginBottom: theme.spacing.lg,
  },
  configCard: {
    alignItems: 'center',
  },
});