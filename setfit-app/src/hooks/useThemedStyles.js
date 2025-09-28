import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const useThemedStyles = (factory) => {
  const { theme } = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
};
