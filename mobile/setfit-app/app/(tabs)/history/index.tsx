import { useFocusEffect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { fetchRecentSessions, SessionLog } from '@/services/persistence/sessionRepository';
import { useTheme } from '@/theme/ThemeProvider';

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')} min`;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getStatusVisual = (
  status: SessionLog['status'],
  palette: { accent: string; alert: string; warning: string },
) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completada',
        borderColor: palette.accent,
        backgroundColor: `${palette.accent}22`,
        textColor: palette.accent,
      };
    case 'aborted':
      return {
        label: 'Abortada',
        borderColor: palette.alert,
        backgroundColor: `${palette.alert}22`,
        textColor: palette.alert,
      };
    default:
      return {
        label: 'En progreso',
        borderColor: palette.warning,
        backgroundColor: `${palette.warning}22`,
        textColor: palette.warning,
      };
  }
};

export default function HistoryScreen() {
  const theme = useTheme();
  const [sessions, setSessions] = React.useState<SessionLog[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadSessions = React.useCallback(async () => {
    try {
      setStatus('loading');
      const results = await fetchRecentSessions(20);
      setSessions(results);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos cargar el historial.');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      void loadSessions();
      return undefined;
    }, [loadSessions]),
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={styles.header}>
          <Text style={[theme.textVariants.title, { color: theme.colors.textPrimary }]}>Historial</Text>
          <Text style={[theme.textVariants.subtitle, { color: theme.colors.textSecondary }]}>Seguimos tus últimas sesiones completadas o abortadas.</Text>
        </View>

        {status === 'loading' ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Cargando historial…</Text>
          </View>
        ) : null}

        {status === 'error' ? (
          <View style={[styles.card, { borderColor: theme.colors.border }]} accessibilityRole="alert">
            <Text style={[theme.textVariants.cardTitle, { color: theme.colors.alert }]}>No se pudo cargar el historial</Text>
            <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>{errorMessage ?? 'Intentá nuevamente en unos segundos.'}</Text>
          </View>
        ) : null}

        {status === 'ready' && sessions.length === 0 ? (
          <View style={[styles.card, { borderColor: theme.colors.border }]} accessibilityRole="text">
            <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Nada por aquí todavía</Text>
            <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Cuando completes o detengas una rutina vas a ver el resumen en este espacio.</Text>
          </View>
        ) : null}

        {sessions.map((session) => {
          const visual = getStatusVisual(session.status, {
            accent: theme.colors.accent,
            alert: theme.colors.alert,
            warning: theme.colors.warning,
          });
          return (
            <View
              key={session.id}
              style={[styles.sessionCard, { borderColor: theme.colors.border }]}
              accessibilityRole="text"
            >
              <View style={styles.sessionHeader}>
                <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>{session.routineName ?? 'Rutina'}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: visual.backgroundColor, borderColor: visual.borderColor },
                  ]}
                >
                  <Text style={[theme.textVariants.caption, { color: visual.textColor }]}>{visual.label}</Text>
                </View>
              </View>
              <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>{formatDateTime(session.startedAt)}</Text>
              <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Duración: {formatDuration(session.totalElapsedSec)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 6,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
