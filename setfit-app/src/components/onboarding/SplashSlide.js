import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export const SplashSlide = ({ onNext }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const gradientOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence of animations
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    logoOpacity.value = withTiming(1, { duration: 800 });

    gradientOpacity.value = withTiming(1, { duration: 1000 });

    // Text animation with delay
    textOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600 })
    );

    textTranslateY.value = withDelay(
      600,
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Animated background gradient */}
      <Animated.View style={[styles.gradientContainer, gradientAnimatedStyle]}>
        <LinearGradient
          colors={[
            theme.colors.primary,
            theme.colors.primaryDark,
            '#1a1a2e',
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Logo container */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          {/* Timer icon representing the logo */}
          <View style={styles.logoIcon}>
            <Text style={styles.timerEmoji}>⏱️</Text>
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View style={textAnimatedStyle}>
          <Text style={styles.appName}>SetFit</Text>
          <Text style={styles.tagline}>Setea tu tiempo, entrena a tu ritmo</Text>
        </Animated.View>
      </View>

      {/* Subtle floating elements */}
      <FloatingElement
        emoji="💪"
        delay={1000}
        startPosition={{ x: width * 0.2, y: height * 0.3 }}
        endPosition={{ x: width * 0.15, y: height * 0.25 }}
      />
      <FloatingElement
        emoji="🔥"
        delay={1200}
        startPosition={{ x: width * 0.8, y: height * 0.7 }}
        endPosition={{ x: width * 0.85, y: height * 0.65 }}
      />
      <FloatingElement
        emoji="⚡"
        delay={1400}
        startPosition={{ x: width * 0.7, y: height * 0.2 }}
        endPosition={{ x: width * 0.75, y: height * 0.15 }}
      />
    </View>
  );
};

const FloatingElement = ({ emoji, delay, startPosition, endPosition }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(startPosition.x);
  const translateY = useSharedValue(startPosition.y);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 1000 })
      )
    );

    translateX.value = withDelay(
      delay,
      withTiming(endPosition.x, { duration: 2000 })
    );

    translateY.value = withDelay(
      delay,
      withTiming(endPosition.y, { duration: 2000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.floatingElement, animatedStyle]}>
      <Text style={styles.floatingEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  floatingElement: {
    position: 'absolute',
  },
  floatingEmoji: {
    fontSize: 24,
  },
});