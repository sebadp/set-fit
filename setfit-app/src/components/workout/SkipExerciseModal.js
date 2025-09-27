import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import { EXERCISE_TYPES, formatDuration } from '../../models/routines';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SkipExerciseModal = ({
  visible = false,
  block,
  currentSet,
  totalSets,
  onSkipSet,
  onSkipExercise,
  onCancel,
  style,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      setSelectedOption(null);
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSkipSet = () => {
    onSkipSet?.();
  };

  const handleSkipExercise = () => {
    onSkipExercise?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const getExerciseDetails = () => {
    if (!block) return '';

    const details = [];
    if (block.exercise_type === EXERCISE_TYPES.REP_BASED) {
      details.push(`${block.reps || 0} repeticiones`);
    } else if (block.exercise_type === EXERCISE_TYPES.TIME_BASED) {
      details.push(`${formatDuration(block.duration || 0)}`);
    }

    if (totalSets > 1) {
      details.push(`${totalSets} series total`);
    }

    return details.join(' • ');
  };

  const renderSkipOption = (
    optionKey,
    icon,
    title,
    description,
    onPress,
    variant = 'default'
  ) => {
    const isSelected = selectedOption === optionKey;
    const variantStyles = {
      default: {
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        backgroundColor: isSelected ? `${theme.colors.primary}10` : theme.colors.surface,
      },
      warning: {
        borderColor: isSelected ? theme.colors.warning : theme.colors.border,
        backgroundColor: isSelected ? `${theme.colors.warning}10` : theme.colors.surface,
      },
    };

    return (
      <TouchableOpacity
        style={[styles.optionCard, variantStyles[variant]]}
        onPress={() => {
          setSelectedOption(optionKey);
          setTimeout(() => onPress(), 200);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>{icon}</Text>
            <Text style={styles.optionTitle}>{title}</Text>
          </View>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
        <View style={styles.optionArrow}>
          <Text style={styles.optionArrowText}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleCancel}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.container,
            style,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Card style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>⏭️ Saltar Ejercicio</Text>
              <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>
            </View>

            {/* Exercise Info */}
            {block && (
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{block.exercise_name}</Text>
                <Text style={styles.exerciseDetails}>{getExerciseDetails()}</Text>
                {currentSet && totalSets && (
                  <Text style={styles.setInfo}>
                    Serie actual: {currentSet} de {totalSets}
                  </Text>
                )}
              </View>
            )}

            {/* Skip Options */}
            <View style={styles.optionsContainer}>
              {currentSet < totalSets && (
                renderSkipOption(
                  'skip_set',
                  '⏭️',
                  'Saltar Esta Serie',
                  `Continúa con la serie ${currentSet + 1} del mismo ejercicio`,
                  handleSkipSet,
                  'default'
                )
              )}

              {renderSkipOption(
                'skip_exercise',
                '⏩',
                'Saltar Todo el Ejercicio',
                'Pasa directamente al siguiente ejercicio de la rutina',
                handleSkipExercise,
                'warning'
              )}
            </View>

            {/* Warning */}
            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>⚠️ Importante:</Text>
              <Text style={styles.warningText}>
                • Tu progreso se guardará automáticamente
              </Text>
              <Text style={styles.warningText}>
                • Los ejercicios saltados no contarán para las estadísticas
              </Text>
              <Text style={styles.warningText}>
                • Puedes revisar tu progreso completo al finalizar
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Cancelar"
                onPress={handleCancel}
                variant="ghost"
                size="large"
                style={styles.actionButton}
              />
            </View>
          </Card>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
  },
  card: {
    padding: 0,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  exerciseInfo: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  exerciseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  exerciseDetails: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  setInfo: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '600',
  },
  optionDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  optionArrow: {
    marginLeft: theme.spacing.md,
  },
  optionArrowText: {
    ...theme.typography.h3,
    color: theme.colors.textMuted,
  },
  warningContainer: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.warning}10`,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  warningTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  warningText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});