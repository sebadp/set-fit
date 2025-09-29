import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import { createShadow } from '../../utils/platformStyles';
import { WORKOUT_STATES } from '../../hooks/useWorkoutExecution';
// TEMPORARILY DISABLED: import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

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
  const opacity = { value: 1 }; // MOCK
  const translateY = { value: 0 }; // MOCK

  useEffect(() => {
    // DISABLED: opacity animation
    // DISABLED: translateY animation
  }, [opacity, translateY]);

  const {} = {
    opacity: 1,
    transform: [{ translateY: 0 }],
  }; // MOCK ANIMATED STYLE
