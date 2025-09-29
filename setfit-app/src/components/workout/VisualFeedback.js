import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { createShadow } from '../../utils/platformStyles';

const { width, height } = Dimensions.get('window');

export const VisualFeedback = ({
  feedbackType = 'none', // 'countdown', 'exercise', 'rest', 'complete', 'pulse'
  intensity = 1, // 0-1
  isActive = false,
  style
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && feedbackType !== 'none') {
      startFeedbackAnimation();
    } else {
      stopFeedbackAnimation();
    }
  }, [isActive, feedbackType, intensity]);

  const startFeedbackAnimation = () => {
    // Fade in the overlay
    Animated.timing(opacityAnim, {
      toValue: 0.3 * intensity,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Different animations for different types
    switch (feedbackType) {
      case 'countdown':
        startCountdownAnimation();
        break;
      case 'exercise':
        startExerciseAnimation();
        break;
      case 'rest':
        startRestAnimation();
        break;
      case 'complete':
        startCompleteAnimation();
        break;
      case 'pulse':
        startPulseAnimation();
        break;
    }
  };

  const stopFeedbackAnimation = () => {
    // Stop all animations first
    pulseAnim.stopAnimation();
    scaleAnim.stopAnimation();
    colorAnim.stopAnimation();
    opacityAnim.stopAnimation();

    // Reset to default values
    pulseAnim.setValue(1);
    scaleAnim.setValue(1);
    colorAnim.setValue(0);
    opacityAnim.setValue(0);
  };

  const startCountdownAnimation = () => {
    // Pulse animation for countdown
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startExerciseAnimation = () => {
    // Energetic pulse for exercise
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRestAnimation = () => {
    // Gentle breathing animation for rest
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCompleteAnimation = () => {
    // Celebration animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Color cycle for celebration
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 3 }
    ).start();
  };

  const startPulseAnimation = () => {
    // Simple pulse for general feedback
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getGradientColors = () => {
    switch (feedbackType) {
      case 'countdown':
        return ['#FFD700', '#FFA500']; // Gold/Orange for countdown
      case 'exercise':
        return ['#FF6B6B', '#FF5252']; // Red for exercise
      case 'rest':
        return ['#74B9FF', '#54A0FF']; // Blue for rest
      case 'complete':
        return ['#26DE81', '#20BF6B']; // Green for complete
      default:
        return [theme.colors.primary, theme.colors.primaryDark];
    }
  };

  const interpolateColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: getGradientColors(),
  });

  if (!isActive || feedbackType === 'none') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

// Flash component for instant feedback
export const FlashFeedback = ({
  feedbackType,
  onComplete,
  duration = 300
}) => {
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 0.8,
        duration: duration / 2,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  const getFlashColor = () => {
    switch (feedbackType) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#FFA500';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.flashContainer,
        {
          backgroundColor: getFlashColor(),
          opacity: flashAnim,
        },
      ]}
    />
  );
};

// Countdown circle component
export const CountdownCircle = ({
  count,
  maxCount = 3,
  size = 120,
  onComplete
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset animations
    scaleAnim.setValue(0);
    opacityAnim.setValue(1);

    // Animate in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, [count]);

  const getCountColor = () => {
    if (count === 1) return '#FF5252'; // Red for final countdown
    if (count === 2) return '#FFA500'; // Orange for 2
    return '#FFD700'; // Gold for 3+
  };

  return (
    <Animated.View
      style={[
        styles.countdownContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getCountColor(),
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.countdownText,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {count}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gradient: {
    flex: 1,
  },
  flashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  countdownContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    ...createShadow({ offsetY: 4, blurRadius: 16, opacity: 0.3, elevation: 10 }),
  },
  countdownText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
