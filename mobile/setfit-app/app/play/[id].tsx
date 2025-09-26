import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { TimerRing } from '@/components/timers/TimerRing';
import { useIntervalEngine } from '@/hooks/useIntervalEngine';
import { finalizeSession, startSession } from '@/services/persistence/sessionRepository';
import { RoutineStore, useRoutineStore } from '@/stores/routineStore';
import { useTheme } from '@/theme/ThemeProvider';
import { generateId } from '@/utils/id';

const selectRoutineById = (state: RoutineStore, routineId?: string | null) =>
  routineId ? state.routines.find((routine) => routine.id === routineId) ?? null : null;

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

export default function PlayRoutineScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();

  const routine = useRoutineStore((state) => selectRoutineById(state, id ?? null));
  const markRoutineAsRan = useRoutineStore((state) => state.markRoutineAsRan);
  const [snapshot, controls] = useIntervalEngine(routine);
  const { start, pause, resume, reset, skip, toggleMute, toggleHaptics } = controls;

  const sessionIdRef = React.useRef<string | null>(null);
  const previousStatusRef = React.useRef(snapshot.status);

  const finalizeSessionRecord = React.useCallback(
    async (status: 'completed' | 'aborted', elapsed: number) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) {
        return;
      }
      sessionIdRef.current = null;
      await finalizeSession({
        id: sessionId,
        status,
        completedAt: new Date().toISOString(),
        totalElapsedSec: elapsed,
      });
    },
    [],
  );

  const beginSession = React.useCallback(async () => {
    if (!routine) {
      return;
    }
    if (sessionIdRef.current) {
      return;
    }
    const sessionId = generateId('session');
    sessionIdRef.current = sessionId;
    const startedAt = new Date().toISOString();
    try {
      await startSession({ id: sessionId, routineId: routine.id, startedAt });
      await markRoutineAsRan(routine.id);
    } catch (error) {
      sessionIdRef.current = null;
      throw error;
    }
  }, [markRoutineAsRan, routine]);

  const handleReset = React.useCallback(async () => {
    if (sessionIdRef.current) {
      await finalizeSessionRecord('aborted', snapshot.totalElapsedSec);
    }
    reset();
  }, [finalizeSessionRecord, reset, snapshot.totalElapsedSec]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        void handleReset();
      };
    }, [handleReset]),
  );

  React.useEffect(() => {
    if (previousStatusRef.current !== 'completed' && snapshot.status === 'completed') {
      void finalizeSessionRecord('completed', snapshot.totalElapsedSec);
    }
    previousStatusRef.current = snapshot.status;
  }, [snapshot.status, snapshot.totalElapsedSec, finalizeSessionRecord]);

  if (!routine) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>Seleccioná una rutina</Text>
          <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>No encontramos la rutina solicitada. Volvé a la lista y elegí una rutina para comenzar.</Text>
          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)/routines/index')}
          >
            <Text style={[theme.textVariants.button, { color: theme.colors.textPrimary }]}>Ir a rutinas</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const currentBlock = snapshot.currentBlock;
  const nextBlock = snapshot.nextBlock;
  const currentDuration = currentBlock?.durationSec ?? 1;
  const rawProgress = snapshot.currentRemainingSec / currentDuration;
  const progress = Number.isFinite(rawProgress) ? Math.max(0, Math.min(1, rawProgress)) : 1;
  const isWarning = snapshot.status === 'running' && snapshot.currentRemainingSec <= 3;
  const totalRemaining = Math.max(0, snapshot.totalDurationSec - snapshot.totalElapsedSec);

  const primaryLabel = (() => {
    switch (snapshot.status) {
      case 'running':
        return 'Pausar';
      case 'paused':
        return 'Reanudar';
      case 'completed':
        return 'Reiniciar';
      default:
        return 'Comenzar';
    }
  })();

  const handlePrimary = React.useCallback(async () => {
    switch (snapshot.status) {
      case 'running':
        pause();
        break;
      case 'paused':
        resume();
        break;
      case 'completed':
        await handleReset();
        await beginSession();
        start();
        break;
      default:
        await beginSession();
        start();
        break;
    }
  }, [beginSession, handleReset, pause, resume, snapshot.status, start]);

  return (
    <Screen padded={false}>
      <View style={[styles.hero, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl }]}
        accessibilityRole="summary"
      >
        <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Ahora</Text>
        <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>{currentBlock?.name ?? 'Listo para empezar'}</Text>
        {currentBlock?.groupId ? (
          <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Serie {currentBlock.iteration}/{currentBlock.totalIterations}</Text>
        ) : null}
      </View>

      <View style={styles.timerWrapper}>
        <TimerRing
          size={300}
          progress={progress}
          state={currentBlock?.type === 'rest' ? 'rest' : 'exercise'}
          warning={isWarning}
        />
        <View style={styles.timerText}>
          <Text style={[theme.textVariants.timer, { color: theme.colors.textPrimary }]}>{formatTime(snapshot.currentRemainingSec)}</Text>
          <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Total {formatTime(totalRemaining)}</Text>
        </View>
      </View>

      <View style={[styles.nextBlock, { paddingHorizontal: theme.spacing.lg }]}>
        <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Siguiente</Text>
        <Text style={[theme.textVariants.body, { color: theme.colors.textPrimary }]}>{nextBlock?.name ?? 'Fin de la rutina'}</Text>
      </View>

      <View style={[styles.controls, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <View style={styles.toggleRow}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: !snapshot.isMuted }}
            onPress={toggleMute}
            style={[styles.toggleButton, { borderColor: theme.colors.border }]}
          >
            <Text style={[theme.textVariants.caption, { color: theme.colors.textPrimary }]}>Sonido {snapshot.isMuted ? 'off' : 'on'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: snapshot.hapticsEnabled }}
            onPress={toggleHaptics}
            style={[styles.toggleButton, { borderColor: theme.colors.border }]}
          >
            <Text style={[theme.textVariants.caption, { color: theme.colors.textPrimary }]}>Háptica {snapshot.hapticsEnabled ? 'on' : 'off'}</Text>
          </Pressable>
        </View>

        <View style={styles.mainButtons}>
          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={() => { void handleReset(); }}
            accessibilityRole="button"
          >
            <Text style={[theme.textVariants.button, { color: theme.colors.textPrimary }]}>Reset</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => { void handlePrimary(); }}
            accessibilityRole="button"
          >
            <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>{primaryLabel}</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={skip}
            accessibilityRole="button"
          >
            <Text style={[theme.textVariants.button, { color: theme.colors.textPrimary }]}>Saltar</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  hero: {
    gap: 6,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  timerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBlock: {
    gap: 6,
  },
  controls: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    gap: 20,
  },
  mainButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
