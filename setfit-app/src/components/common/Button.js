import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { buttonStates } from '../../constants/colors';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility requirement
  },

  // Variants
  primary: {
    backgroundColor: buttonStates.default,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: buttonStates.default,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },

  // States
  disabled: {
    backgroundColor: buttonStates.disabled,
    opacity: 0.6,
  },

  // Text styles
  text: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  primaryText: {
    color: theme.colors.text,
  },
  secondaryText: {
    color: buttonStates.default,
  },
  ghostText: {
    color: buttonStates.default,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: '#163D31',
    opacity: 0.4,
  },
});