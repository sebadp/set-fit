import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import {
  RoutineStore,
  selectLastUsedRoutine,
  selectRoutineSummaries,
  useRoutineStore,
} from '@/stores/routineStore';
import { useTheme } from '@/theme/ThemeProvider';

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}´ ${seconds.toString().padStart(2, '0')}″`;
};

const selectStatus = (state: RoutineStore) => ({
  status: state.status,
  errorMessage: state.errorMessage,
});

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const selectRoutine = useRoutineStore((state) => state.selectRoutine);
  const { status, errorMessage } = useRoutineStore(selectStatus);
  const cardBackground = theme.colorScheme === 'light' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(17, 24, 39, 0.72)';
  const buttonBackground = theme.colors.accent;
  const routineSummaries = useRoutineStore(selectRoutineSummaries);
  const lastUsedRoutine = useRoutineStore(selectLastUsedRoutine);

  const handleOpenRoutine = (routineId: string) => {
    selectRoutine(routineId);
    router.push(`/play/${routineId}`);
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>SetFit</Text>
        </View>
        <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Cargando rutinas…</Text>
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>SetFit</Text>
        </View>
        <View style={styles.section}>
          <Text style={[theme.textVariants.cardTitle, { color: theme.colors.alert }]}>No pudimos cargar las rutinas</Text>
          <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>
            {errorMessage ?? 'Reintentá más tarde.'}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>SetFit</Text>
        <Text style={[theme.textVariants.subtitle, { color: theme.colors.textSecondary }]}>Bloques. Ritmo. Resultado.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: theme.colors.border }]}>
        <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Arrastrá bloques y creá tu ritmo</Text>
        <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Define ejercicios, descansos y agrupalos en series. SetFit te guía con audio, color y háptica para que llegues a la última repetición con energía.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/routines/new')}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: pressed ? buttonBackground + 'cc' : buttonBackground,
            },
          ]}
        >
          <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>Nueva rutina</Text>
        </Pressable>
      </View>

      {lastUsedRoutine ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => handleOpenRoutine(lastUsedRoutine.id)}
          style={[styles.section, { borderColor: theme.colors.border }]}
        >
          <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Última rutina</Text>
          <View style={[styles.routineItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[theme.textVariants.body, { color: theme.colors.textPrimary }]}>{lastUsedRoutine.name}</Text>
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>
              {formatDuration(lastUsedRoutine.totalDurationSec)} · Actualizada {new Date(lastUsedRoutine.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </Pressable>
      ) : null}

      <View style={[styles.section, { borderColor: theme.colors.border }]} accessibilityRole="list">
        <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Rutinas guardadas</Text>
        {routineSummaries.map((routine) => (
          <Pressable
            key={routine.id}
            accessibilityRole="button"
            onPress={() => handleOpenRoutine(routine.id)}
            style={({ pressed }) => [
              styles.routineItem,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[theme.textVariants.body, { color: theme.colors.textPrimary }]}>{routine.name}</Text>
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>
              {formatDuration(routine.totalDurationSec)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginBottom: 24,
  },
  routineItem: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
});
