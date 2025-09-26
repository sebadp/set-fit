import { SplashScreen, Stack } from 'expo-router';
import React from 'react';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { RedHatMono_500Medium } from '@expo-google-fonts/red-hat-mono';

import { initializeDatabase } from '@/services/persistence/db';
import { useRoutineStore } from '@/stores/routineStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  const [appReady, setAppReady] = React.useState(false);
  const [appError, setAppError] = React.useState<string | null>(null);

  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => undefined);
  }, []);

  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    RedHatMono_500Medium,
  });

  React.useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        await useRoutineStore.getState().hydrate();
        setAppReady(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setAppError(message);
        useRoutineStore.setState({ status: 'error', errorMessage: message });
        setAppReady(true);
      }
    })();
  }, []);

  React.useEffect(() => {
    if ((fontsLoaded || fontsError) && (appReady || appError)) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontsError, appReady, appError]);

  if ((!fontsLoaded && !fontsError) || (!appReady && !appError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="routines/new"
            options={{
              headerShown: true,
              title: 'Nueva rutina',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="routines/[id]"
            options={{
              headerShown: true,
              title: 'Editar rutina',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="play/[id]"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
