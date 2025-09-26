import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type TimerRingProps = {
  size?: number;
  progress: number; // value between 0 (empty) and 1 (full)
  state: 'exercise' | 'rest';
  warning?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const TimerRing = ({ size = 280, progress, state, warning = false }: TimerRingProps) => {
  const theme = useTheme();
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressValue = useSharedValue(1);

  React.useEffect(() => {
    progressValue.value = withTiming(clamp(progress, 0, 1), { duration: 160 });
  }, [progress, progressValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  const trackColor = theme.colorScheme === 'light' ? 'rgba(17,24,39,0.08)' : 'rgba(255,255,255,0.12)';
  const stateColor = state === 'exercise' ? theme.colors.accent : theme.colors.rest;
  const strokeColor = warning ? theme.colors.warning : stateColor;

  return (
    <View style={[styles.container, { width: size, height: size }]}
      accessibilityRole="image"
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
