import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { createShadow, createTextShadow } from '../../utils/platformStyles';

const { width } = Dimensions.get('window');

export const ReadySlide = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { onboardingData } = useOnboarding();

  const confettiScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const summaryOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence of entrance animations
    confettiScale.value = withSpring(1, { delay: 200 });
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    summaryOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
  }, []);

  const handleStartWorkout = () => {
    setIsExiting(true);
    
    // Exit animation
    titleOpacity.value = withTiming(0, { duration: 300 });
    summaryOpacity.value = withTiming(0, { duration: 300 });
    buttonOpacity.value = withTiming(0, { duration: 300 });

    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleExploreFirst = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const summaryAnimatedStyle = useAnimatedStyle(() => ({
    opacity: summaryOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const userName = onboardingData.userName || 'Atleta';
  const createdExercises = onboardingData.createdExercises?.length || 0;
  const createdRoutines = onboardingData.createdRoutines?.length || 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Confetti elements */}
      <ConfettiElement emoji="🎉" position={{ x: width * 0.1, y: 100 }} animatedStyle={confettiAnimatedStyle} />
      <ConfettiElement emoji="✨" position={{ x: width * 0.9, y: 150 }} animatedStyle={confettiAnimatedStyle} />
      <ConfettiElement emoji="🎆" position={{ x: width * 0.2, y: 200 }} animatedStyle={confettiAnimatedStyle} />
      <ConfettiElement emoji="🎉" position={{ x: width * 0.8, y: 250 }} animatedStyle={confettiAnimatedStyle} />
      <ConfettiElement emoji="✨" position={{ x: width * 0.15, y: 300 }} animatedStyle={confettiAnimatedStyle} />

      <View style={styles.content}>
        {/* Main message */}
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.bigEmoji}>🚀</Text>
          <Text style={styles.title}>¡{userName}, estás listo!</Text>
          <Text style={styles.subtitle}>
            Ya tenés todo para empezar a entrenar
          </Text>
        </Animated.View>

        {/* Achievement summary */}
        <Animated.View style={[styles.summary, summaryAnimatedStyle]}>
          <Text style={styles.summaryTitle}>Lo que lograste:</Text>
          
          <SummaryItem 
            text="Timer configurado"
            icon="✅"
          />
          
          {createdExercises > 0 && (
            <SummaryItem 
              text={`${createdExercises} ejercicio${createdExercises > 1 ? 's' : ''} agregado${createdExercises > 1 ? 's' : ''}`}
              icon="✅"
            />
          )}
          
          {createdRoutines > 0 && (
            <SummaryItem 
              text="Primera rutina creada"
              icon="✅"
            />
          )}
          
          <SummaryItem 
            text="Preferencias configuradas"
            icon="✅"
          />
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.startGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startButtonText}>
                Empezar mi primer entrenamiento
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={handleExploreFirst}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>
              Explorar la app primero
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const ConfettiElement = ({ emoji, position, animatedStyle }) => (
  <Animated.View
    style={[
      styles.confettiElement,
      {
        left: position.x,
        top: position.y,
      },
      animatedStyle,
    ]}
  >
    <Text style={styles.confettiEmoji}>{emoji}</Text>
  </Animated.View>
);

const SummaryItem = ({ text, icon }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryIcon}>{icon}</Text>
    <Text style={styles.summaryText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, width },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  header: { alignItems: 'center', marginBottom: theme.spacing.xxl },
  bigEmoji: { fontSize: 80, marginBottom: theme.spacing.lg },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md, ...createTextShadow({ offsetY: 2, blurRadius: 4 }) },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 24 },
  summary: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 16, marginBottom: theme.spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%', maxWidth: 300 },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: 'white', textAlign: 'center', marginBottom: theme.spacing.md },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryIcon: { fontSize: 16, marginRight: 12 },
  summaryText: { fontSize: 14, color: 'white', flex: 1 },
  buttonContainer: { width: '100%', maxWidth: 300 },
  startButton: { borderRadius: 25, overflow: 'hidden', marginBottom: theme.spacing.lg, ...createShadow({ offsetY: 4, blurRadius: 16, opacity: 0.3, elevation: 8 }) },
  startGradient: { paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' },
  startButtonText: { color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  exploreButton: { paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' },
  exploreButtonText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500', textDecorationLine: 'underline' },
  confettiElement: { position: 'absolute' },
  confettiEmoji: { fontSize: 24 },
});
