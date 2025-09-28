import React, { useState, useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Tab Screens
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { QuickStartScreen } from '../screens/tabs/QuickStartScreen';
import { ProgressScreen } from '../screens/tabs/ProgressScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';

// Existing Screens
import { RoutinesScreen } from '../screens/RoutinesScreen';
import { CreateRoutineScreen } from '../screens/CreateRoutineScreen';
import { WorkoutExecutionScreen } from '../screens/WorkoutExecutionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Onboarding
import { OnboardingScreen } from '../screens/OnboardingScreen';

// Navigation Components
import { CustomTabBar } from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Home Tab
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="WorkoutExecution" component={WorkoutExecutionScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Stack Navigator for QuickStart Tab
const QuickStartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="QuickStartMain" component={QuickStartScreen} />
    <Stack.Screen name="WorkoutExecution" component={WorkoutExecutionScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Routines Tab
const RoutinesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RoutinesMain" component={RoutinesScreen} />
    <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
    <Stack.Screen name="WorkoutExecution" component={WorkoutExecutionScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Progress Tab
const ProgressStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProgressMain" component={ProgressScreen} />
  </Stack.Navigator>
);

// Stack Navigator for Profile Tab
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
    initialRouteName="QuickStart"
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarLabel: 'Inicio',
      }}
    />
    <Tab.Screen
      name="QuickStart"
      component={QuickStartStack}
      options={{
        tabBarLabel: 'Entrenar',
      }}
    />
    <Tab.Screen
      name="Routines"
      component={RoutinesStack}
      options={{
        tabBarLabel: 'Rutinas',
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressStack}
      options={{
        tabBarLabel: 'Progreso',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarLabel: 'Perfil',
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
export const AppNavigator = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);
  const { theme, mode } = useTheme();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_completed');
      setIsOnboardingComplete(onboardingComplete === 'true');
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
      setIsOnboardingComplete(false);
    }
  };

  // Show loading while checking onboarding status
  if (isOnboardingComplete === null) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  const navigationTheme = useMemo(
    () => ({
      dark: mode === 'dark',
      colors: {
        background: theme.colors.background,
        card: theme.colors.surface,
        border: theme.colors.border,
        primary: theme.colors.primary,
        text: theme.colors.text,
        notification: theme.colors.accent,
      },
    }),
    [theme, mode]
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboardingComplete ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ gestureEnabled: false }}
          />
        ) : null}
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
