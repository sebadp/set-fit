import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { audioService } from '../../services/AudioService';
import { createShadow, createTextShadow } from '../../utils/platformStyles';

const { width, height } = Dimensions.get('window');

export const TimerFeatureSlide = ({ onNext, onDataUpdate }) => {
  const [seconds, setSeconds] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasTriedTimer, setHasTriedTimer] = useState(false);

  const timerInterval = useRef(null);
  const { onboardingData } = useOnboarding();

  // Animation values
  const timerScale = useSharedValue(1);
  const timerOpacity = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const successScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    titleOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      timerInterval.current = setTimeout(() => {
        setSeconds(prev => {
          const newSeconds = prev - 1;

          // Warning animations for last 3 seconds
          if (newSeconds <= 3 && newSeconds > 0) {
            triggerWarningFeedback(newSeconds);
          }

          // Completion
          if (newSeconds === 0) {
            triggerCompletionFeedback();
            setIsRunning(false);
            setIsCompleted(true);
            setHasTriedTimer(true);

            // Update onboarding progress
            onDataUpdate({
              progress: {
                ...onboardingData.progress,
                timerTried: true,
              },
            });
          }

          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval.current) {
        clearTimeout(timerInterval.current);
      }
    };
  }, [isRunning, seconds]);

  const triggerWarningFeedback = useCallback(async (countdown) => {
    // Visual feedback
    timerScale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );

    // Audio feedback
    try {
      await audioService.playCountdown(countdown);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }

    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [timerScale]);

  const triggerCompletionFeedback = useCallback(async () => {
    // Visual feedback
    successScale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );

    // Audio feedback
    try {
      await audioService.playSetComplete();
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }

    // Haptic feedback
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [successScale]);

  const startTimer = () => {
    if (!isRunning) {
      setSeconds(5);
      setIsRunning(true);
      setIsCompleted(false);

      buttonScale.value = withSequence(
        withSpring(0.9),
        withSpring(1)
      );
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(5);
    setIsCompleted(false);
    if (timerInterval.current) {
      clearTimeout(timerInterval.current);
    }
  };

  // Animation styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const timerAnimatedStyle = useAnimatedStyle(() => {
    const isWarning = seconds <= 3 && seconds > 0 && isRunning;
    const isDanger = seconds <= 1 && seconds > 0 && isRunning;

    const backgroundColor = interpolateColor(
      isWarning ? (isDanger ? 1 : 0.5) : 0,
      [0, 0.5, 1],
      [theme.colors.primary, '#FFA500', '#FF5252']
    );

    return {
      transform: [{ scale: timerScale.value }],
      opacity: timerOpacity.value,
      backgroundColor,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#4facfe', '#00f2fe', '#43e97b']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Title */}
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.title}>Timer inteligente que te avisa 🔔</Text>
          <Text style={styles.subtitle}>
            Te avisamos 3 segundos antes de cambiar de ejercicio
          </Text>
        </Animated.View>

        {/* Timer demo */}
        <View style={styles.demoArea}>
          <Animated.View style={[styles.timerContainer, timerAnimatedStyle]}>
            <Text style={styles.timerText}>{seconds}</Text>
            <Text style={styles.timerLabel}>segundos</Text>
          </Animated.View>

          {/* Play button */}
          {!isRunning && !isCompleted && (
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={startTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.playIcon}>▶️</Text>
                <Text style={styles.playText}>¡Pruébalo!</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Reset button */}
          {(isRunning || isCompleted) && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetTimer}
              activeOpacity={0.8}
            >
              <Text style={styles.resetText}>🔄 Repetir</Text>
            </TouchableOpacity>
          )}

          {/* Success message */}
          {isCompleted && (
            <Animated.View style={[styles.successContainer, successAnimatedStyle]}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successText}>¡Genial! Ya dominas el timer</Text>
            </Animated.View>
          )}
        </View>

        {/* Features showcase */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Características:</Text>
          <View style={styles.features}>
            <FeaturePill
              icon="🔊"
              text="Alertas sonoras"
              isActive={hasTriedTimer}
            />
            <FeaturePill
              icon="📳"
              text="Vibración"
              isActive={hasTriedTimer}
            />
            <FeaturePill
              icon="👁️"
              text="Cambio de color"
              isActive={hasTriedTimer}
            />
          </View>
        </View>

        {/* Continue button */}
        {hasTriedTimer && (
          <Animated.View style={[styles.continueContainer, successAnimatedStyle]}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.success, '#20BF6B']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueText}>Continuar ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const FeaturePill = ({ icon, text, isActive }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.featurePill, animatedStyle]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    ...createTextShadow({ offsetY: 2, blurRadius: 4 }),
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  demoArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  timerContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...createShadow({ offsetY: 4, blurRadius: 20, opacity: 0.3, elevation: 8 }),
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  playText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  resetText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  successEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: theme.spacing.md,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  continueContainer: {
    width: '100%',
    maxWidth: 200,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...createShadow({ offsetY: 4, blurRadius: 16, opacity: 0.3, elevation: 4 }),
  },
  continueGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
