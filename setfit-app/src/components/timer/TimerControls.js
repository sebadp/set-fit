import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { theme } from '../../constants/theme';

export const TimerControls = ({
  isActive,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onReset,
  disabled = false
}) => {
  const getPlayPauseTitle = () => {
    if (isActive && !isPaused) return 'Pausar';
    if (isPaused) return 'Reanudar';
    return 'Iniciar';
  };

  const handlePlayPause = () => {
    if (isActive && !isPaused) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainControls}>
        <Button
          title={getPlayPauseTitle()}
          onPress={handlePlayPause}
          size="large"
          disabled={disabled}
          style={styles.playButton}
        />
      </View>

      <View style={styles.secondaryControls}>
        <Button
          title="Detener"
          onPress={onStop}
          variant="secondary"
          size="medium"
          disabled={disabled || (!isActive && !isPaused)}
          style={styles.controlButton}
        />

        <Button
          title="Reiniciar"
          onPress={onReset}
          variant="ghost"
          size="medium"
          disabled={disabled}
          style={styles.controlButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  mainControls: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  playButton: {
    width: '80%',
    maxWidth: 200,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  controlButton: {
    flex: 1,
    maxWidth: 120,
  },
});