import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { RoutineStore, useRoutineStore } from '@/stores/routineStore';
import { useTheme } from '@/theme/ThemeProvider';

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')} min`;
};

const selectRoutines = (state: RoutineStore) => state.routines;
const selectSelectRoutine = (state: RoutineStore) => state.selectRoutine;
const selectStatus = (state: RoutineStore) => ({ status: state.status, errorMessage: state.errorMessage });

export default function RoutinesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const routines = useRoutineStore(selectRoutines);
  const selectRoutine = useRoutineStore(selectSelectRoutine);
  const { status, errorMessage } = useRoutineStore(selectStatus);

  const handleOpenRoutine = (routineId: string) => {
    selectRoutine(routineId);
    router.push(`/routines/${routineId}`);
  };

  const handlePlayRoutine = (routineId: string) => {
    selectRoutine(routineId);
    router.push(`/play/${routineId}`);
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>Rutinas</Text>
          <Text style={[theme.textVariants.subtitle, { color: theme.colors.textSecondary }]}>Cargando…</Text>
        </View>
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>Rutinas</Text>
        </View>
        <View style={styles.errorCard}>
          <Text style={[theme.textVariants.cardTitle, { color: theme.colors.alert }]}>No se pudieron cargar las rutinas</Text>
          <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>
            {errorMessage ?? 'Intentá nuevamente.'}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>Rutinas</Text>
        <Text style={[theme.textVariants.subtitle, { color: theme.colors.textSecondary }]}>Organizalas por bloques y series.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/routines/new')}
        style={({ pressed }) => [
          styles.creationCard,
          {
            borderColor: theme.colors.border,
            backgroundColor: pressed ? theme.colors.surface : 'transparent',
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Nueva rutina</Text>
        <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Arrastrá bloques de ejercicio y descanso para armar tu ritmo.</Text>
      </Pressable>

      <View style={styles.list}>
        {routines.map((routine) => (
          <Pressable
            key={routine.id}
            onPress={() => handleOpenRoutine(routine.id)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.routineCard,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>{routine.name}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePlayRoutine(routine.id)}
                style={({ pressed }) => [
                  styles.quickStartButton,
                  {
                    borderColor: pressed ? theme.colors.accent : theme.colors.border,
                    backgroundColor: pressed ? `${theme.colors.accent}22` : 'transparent',
                  },
                ]}
              >
                <Text style={[theme.textVariants.caption, { color: theme.colors.textPrimary }]}>Ejecutar</Text>
              </Pressable>
            </View>
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>
              {formatDuration(routine.totalDurationSec)} · {routine.blocks.length} bloques
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
  creationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    marginBottom: 24,
  },
  list: {
    gap: 16,
  },
  routineCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  quickStartButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
