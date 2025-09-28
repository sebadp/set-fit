import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

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
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};