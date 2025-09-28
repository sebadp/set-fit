import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, darkTheme, lightTheme } from '../constants/theme';

const STORAGE_KEY = 'setfit_theme_preference_v1';
const ThemeContext = createContext({
  theme: darkTheme,
  mode: 'dark',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = Appearance?.getColorScheme?.() ?? 'dark';
  const [mode, setMode] = useState(systemScheme === 'light' ? 'light' : 'dark');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) return;
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        }
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (!colorScheme) return;
      // Follow system only if user hasn't set explicit preference yet
      AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
        if (!stored) {
          setMode(colorScheme === 'light' ? 'light' : 'dark');
        }
      });
    });
    return () => {
      isMounted = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode, isHydrated]);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      setThemeMode: (nextMode) => {
        if (nextMode === 'light' || nextMode === 'dark') {
          setMode(nextMode);
        }
      },
      toggleTheme: () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
      },
      isHydrated,
    }),
    [theme, mode, isHydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
