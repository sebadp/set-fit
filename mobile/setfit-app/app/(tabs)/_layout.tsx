import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Tabs } from 'expo-router';

import { useTheme } from '../../src/theme/ThemeProvider';

const iconMap: Record<string, { default: React.ComponentProps<typeof Ionicons>['name']; focused: React.ComponentProps<typeof Ionicons>['name'] }> = {
  index: { default: 'home-outline', focused: 'home' },
  'routines/index': { default: 'albums-outline', focused: 'albums' },
  'history/index': { default: 'time-outline', focused: 'time' },
};

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 10,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.sansMedium,
          fontSize: 12,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const mapping = iconMap[route.name] ?? iconMap.index;
          const iconName = focused ? mapping.focused : mapping.default;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="routines/index" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="history/index" options={{ title: 'Historial' }} />
    </Tabs>
  );
}
