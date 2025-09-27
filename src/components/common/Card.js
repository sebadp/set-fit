import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const Card = ({ children, style, elevation = 'card', ...props }) => {
  return (
    <View style={[styles.base, theme.shadows[elevation], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
});