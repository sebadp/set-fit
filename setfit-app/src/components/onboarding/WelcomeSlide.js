import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { createShadow, createTextShadow } from '../../utils/platformStyles';

const { width, height } = Dimensions.get('window');

export const WelcomeSlide = ({ onNext, onDataUpdate }) => {
  const [userName, setUserName] = useState('');
  const { onboardingData } = useOnboarding();

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const inputOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const confettiScale = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    titleOpacity.value = withDelay(200, withSpring(1));
    titleTranslateY.value = withDelay(200, withSpring(0));

    inputOpacity.value = withDelay(600, withSpring(1));
    inputTranslateY.value = withDelay(600, withSpring(0));

    buttonOpacity.value = withDelay(1000, withSpring(1));
    buttonScale.value = withDelay(1000, withSpring(1));
  }, []);

  useEffect(() => {
    // Update parent data when name changes
    onDataUpdate({
      userName: userName.trim(),
    });
  }, [userName]);

  const handleNext = () => {
    if (userName.trim()) {
      // Trigger confetti animation
      confettiScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );

      setTimeout(() => {
        onNext();
      }, 300);
    }
  };

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const greetingText = userName.trim()
    ? (
        <Animated.Text style={[styles.greeting, titleAnimatedStyle]} key="greeting">
          ¡Hola, {userName}! 👋
        </Animated.Text>
      )
    : null;

  const inputSectionChildren = React.Children.toArray([
    <Text style={styles.question} key="question">
      ¿Cómo te llamas?
    </Text>,
    <View style={styles.inputContainer} key="input">
      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={userName}
        onChangeText={setUserName}
        autoFocus
        maxLength={30}
        returnKeyType="done"
        onSubmitEditing={handleNext}
      />
    </View>,
    greetingText,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Confetti elements */}
      <ConfettiElement
        emoji="🎉"
        position={{ x: width * 0.15, y: height * 0.2 }}
        animatedStyle={confettiAnimatedStyle}
      />
      <ConfettiElement
        emoji="✨"
        position={{ x: width * 0.85, y: height * 0.3 }}
        animatedStyle={confettiAnimatedStyle}
      />
      <ConfettiElement
        emoji="🚀"
        position={{ x: width * 0.1, y: height * 0.7 }}
        animatedStyle={confettiAnimatedStyle}
      />

      <View style={styles.content}>
        {/* Welcome message */}
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={styles.emoji}>⏱️</Text>
          <Text style={styles.title}>Bienvenido a SetFit</Text>
          <Text style={styles.subtitle}>
            Setea tu tiempo, entrena a tu ritmo
          </Text>
        </Animated.View>

        {/* Name input section */}
        <Animated.View style={[styles.inputSection, inputAnimatedStyle]}>
          {inputSectionChildren}
        </Animated.View>

        {/* Continue button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !userName.trim() && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!userName.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                userName.trim()
                  ? [theme.colors.primary, theme.colors.primaryDark]
                  : ['#6B7280', '#4B5563']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {userName.trim() ? `¡Hola, ${userName}! 👋` : 'Continuar'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Motivational text */}
        <Animated.View style={[styles.motivationContainer, inputAnimatedStyle]}>
          <Text style={styles.motivationText}>
            "Cada gran entrenamiento comienza con un nombre"
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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

const textShadowStrong = createTextShadow({ offsetY: 2, blurRadius: 4 });
const textShadowSoft = createTextShadow({ offsetY: 1, blurRadius: 2 });
const buttonShadow = createShadow({ offsetY: 4, blurRadius: 16, opacity: 0.3, elevation: 4 });

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
    paddingVertical: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    ...textShadowStrong,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 24,
  },
  inputSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  question: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 280,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greeting: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: theme.spacing.md,
    ...textShadowSoft,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginBottom: theme.spacing.lg,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...buttonShadow,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  motivationContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  motivationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  confettiElement: {
    position: 'absolute',
  },
  confettiEmoji: {
    fontSize: 20,
  },
});
