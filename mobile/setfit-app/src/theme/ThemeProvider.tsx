import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';

import { palette } from './palette';
import { radii, spacing } from './tokens';
import { fontFamilies, textVariants } from './typography';

export type ThemeColors = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  rest: string;
  warning: string;
  alert: string;
  border: string;
};

export type Theme = {
  colorScheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: typeof fontFamilies;
  textVariants: typeof textVariants;
};

const buildColors = (scheme: 'light' | 'dark'): ThemeColors => {
  const isLight = scheme === 'light';
  return {
    background: isLight ? palette.neutral.paper : palette.neutral.charcoal,
    surface: isLight ? '#F7FAFC' : '#111827',
    textPrimary: isLight ? palette.neutral.ink : palette.neutral.cloud,
    textSecondary: isLight ? '#374151' : palette.neutral.slate,
    accent: palette.core.active,
    rest: palette.core.rest,
    warning: palette.core.warning,
    alert: palette.core.alert,
    border: isLight ? 'rgba(17, 24, 39, 0.12)' : 'rgba(229, 231, 235, 0.12)',
  };
};

const defaultTheme: Theme = {
  colorScheme: 'dark',
  colors: buildColors('dark'),
  spacing,
  radii,
  fonts: fontFamilies,
  textVariants,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const colorScheme: 'light' | 'dark' = systemScheme === 'light' ? 'light' : 'dark';

  const value = useMemo<Theme>(
    () => ({
      colorScheme,
      colors: buildColors(colorScheme),
      spacing,
      radii,
      fonts: fontFamilies,
      textVariants,
    }),
    [colorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: value.colors.background }}>
        <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
