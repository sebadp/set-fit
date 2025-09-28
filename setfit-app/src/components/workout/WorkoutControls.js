import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import { createShadow } from '../../utils/platformStyles';
import { WORKOUT_STATES } from '../../hooks/useWorkoutExecution';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

export const WorkoutControls = ({
  workoutState,
  onPause,
  onResume,
  onSkip,
  onStop,
  onComplete,
  canPause = false,
  canResume = false,
  canSkip = false,
  showComplete = false,
  style,
}) => {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-40);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    translateY.value = withSpring(0, {
      damping: 14,
      stiffness: 140,
      overshootClamping: false,
    });
  }, [opacity, translateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handlePause = () => {
    onPause?.();
  };

  const handleResume = () => {
    onResume?.();
  };

  const handleSkip = () => {
    Alert.alert(
      '⏭️ Saltar Ejercicio',
      '¿Estás seguro de que quieres saltar este ejercicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Saltar',
          style: 'default',
          onPress: () => onSkip?.(),
        },
      ]
    );
  };

  const handleStop = () => {
    setShowStopConfirm(true);
  };

  const confirmStop = () => {
    setShowStopConfirm(false);
    onStop?.();
  };

  const cancelStop = () => {
    setShowStopConfirm(false);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  const getStateInfo = () => {
    switch (workoutState) {
      case WORKOUT_STATES.PREPARING:
        return {
          title: '🏁 Preparándose',
          subtitle: 'Listo para comenzar',
          color: theme.colors.success,
        };
      case WORKOUT_STATES.ACTIVE:
        return {
          title: '🔥 Entrenando',
          subtitle: 'Entrenamiento en progreso',
          color: theme.colors.primary,
        };
      case WORKOUT_STATES.PAUSED:
        return {
          title: '⏸️ Pausado',
          subtitle: 'Entrenamiento en pausa',
          color: theme.colors.warning,
        };
      case WORKOUT_STATES.COMPLETED:
        return {
          title: '✅ Completado',
          subtitle: 'Entrenamiento finalizado',
          color: theme.colors.success,
        };
      case WORKOUT_STATES.STOPPED:
        return {
          title: '⏹️ Detenido',
          subtitle: 'Entrenamiento interrumpido',
          color: theme.colors.error,
        };
      default:
        return {
          title: '⚪ Estado Desconocido',
          subtitle: '',
          color: theme.colors.textSecondary,
        };
    }
  };

  const stateInfo = getStateInfo();

  const renderMainControls = () => {
    if (showComplete) {
      return (
        <View style={styles.completeSection}>
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>🎉 Completar Entrenamiento</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.controlsContainer}>
        {/* Primary Action Button */}
        <View style={styles.primaryAction}>
          {canResume && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.success }]}
              onPress={handleResume}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonIcon}>▶️</Text>
              <Text style={styles.primaryButtonText}>Reanudar</Text>
            </TouchableOpacity>
          )}

          {canPause && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.warning }]}
              onPress={handlePause}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonIcon}>⏸️</Text>
              <Text style={styles.primaryButtonText}>Pausar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          {canSkip && (
            <Button
              title="⏭️ Saltar"
              onPress={handleSkip}
              variant="ghost"
              size="medium"
              style={styles.secondaryButton}
            />
          )}

          <Button
            title="⏹️ Detener"
            onPress={handleStop}
            variant="outline"
            size="medium"
            style={[styles.secondaryButton, styles.stopButton]}
          />
        </View>
      </View>
    );
  };

  const renderStopConfirmation = () => (
    <View style={styles.confirmContainer}>
      <View style={styles.confirmContent}>
        <Text style={styles.confirmTitle}>⚠️ Detener Entrenamiento</Text>
        <Text style={styles.confirmMessage}>
          ¿Estás seguro de que quieres detener el entrenamiento? Tu progreso se guardará.
        </Text>
        <View style={styles.confirmActions}>
          <Button
            title="Cancelar"
            onPress={cancelStop}
            variant="ghost"
            size="medium"
            style={styles.confirmButton}
          />
          <Button
            title="Detener"
            onPress={confirmStop}
            variant="outline"
            size="medium"
            style={[styles.confirmButton, styles.confirmStopButton]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, style, animatedContainerStyle]}>
      <Card style={styles.card}>
        {/* State Header */}
        <View style={[styles.header, { backgroundColor: `${stateInfo.color}15` }]}>
          <View style={styles.stateIndicator}>
            <View style={[styles.statusDot, { backgroundColor: stateInfo.color }]} />
            <View>
              <Text style={styles.stateTitle}>{stateInfo.title}</Text>
              <Text style={styles.stateSubtitle}>{stateInfo.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        {showStopConfirm ? renderStopConfirmation() : renderMainControls()}

        {/* Quick Tips */}
        {workoutState === WORKOUT_STATES.PAUSED && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Durante la pausa:</Text>
            <Text style={styles.tipText}>• Tu progreso se guarda automáticamente</Text>
            <Text style={styles.tipText}>• Hidrátate y respira profundamente</Text>
            <Text style={styles.tipText}>• Presiona reanudar cuando estés listo</Text>
          </View>
        )}

        {workoutState === WORKOUT_STATES.ACTIVE && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>🔥 Mantén el ritmo:</Text>
            <Text style={styles.tipText}>• Mantén una buena forma en cada ejercicio</Text>
            <Text style={styles.tipText}>• Respira de manera controlada</Text>
            <Text style={styles.tipText}>• Puedes pausar en cualquier momento</Text>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    padding: 0,
  },
  header: {
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stateTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  stateSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  controlsContainer: {
    padding: theme.spacing.lg,
  },
  primaryAction: {
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
    ...createShadow({ offsetY: 4, blurRadius: 20, opacity: 0.3, elevation: 6 }),
  },
  primaryButtonIcon: {
    fontSize: 24,
  },
  primaryButtonText: {
    ...theme.typography.h3,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
  stopButton: {
    borderColor: theme.colors.error,
  },
  completeSection: {
    padding: theme.spacing.lg,
  },
  completeButton: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...createShadow({ offsetY: 4, blurRadius: 20, opacity: 0.3, elevation: 6 }),
  },
  completeButtonText: {
    ...theme.typography.h2,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  confirmContainer: {
    padding: theme.spacing.lg,
  },
  confirmContent: {
    alignItems: 'center',
  },
  confirmTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  confirmMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
  },
  confirmStopButton: {
    borderColor: theme.colors.error,
  },
  tipsContainer: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  tipsTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
});
