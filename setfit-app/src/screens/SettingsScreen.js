import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, Button } from '../components/common';
import { theme } from '../constants/theme';
import { useSettings, useUserProfile, useDatabase } from '../hooks/useDatabase';
import { SETTING_KEYS } from '../constants/database';

export const SettingsScreen = ({ onBack }) => {
  const { database } = useDatabase();
  const { user, updateUser } = useUserProfile();
  const { settings, updateSetting, loading } = useSettings();
  const [userName, setUserName] = useState(user?.name || '');

  const handleUpdateName = async () => {
    try {
      if (userName.trim()) {
        await updateUser({ name: userName.trim() });
        Alert.alert('✅ Éxito', 'Nombre actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el nombre');
    }
  };

  const handleToggleSetting = async (key, value) => {
    try {
      await updateSetting(key, value);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar la configuración');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await database.exportData(1);
      Alert.alert(
        '📊 Datos Exportados',
        `Datos exportados correctamente.\n\nEjercicios: ${data.stats?.total_workouts || 0}\nTiempo total: ${Math.round((data.stats?.total_time || 0) / 60)} min`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudieron exportar los datos');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Confirmar Reset',
      '¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.dropAllTables();
              await database.init();
              Alert.alert('✅ Completado', 'Todos los datos han sido borrados');
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudieron borrar los datos');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
          {onBack && (
            <Button
              title="← Volver"
              onPress={onBack}
              variant="ghost"
              size="small"
              style={styles.backButton}
            />
          )}
        </View>

        {/* Profile Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Tu nombre"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Button
              title="Guardar"
              onPress={handleUpdateName}
              size="small"
              style={styles.saveButton}
            />
          </View>
        </Card>

        {/* Timer Preferences */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias del Timer</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sonidos habilitados</Text>
            <Switch
              value={settings[SETTING_KEYS.SOUNDS_ENABLED] ?? true}
              onValueChange={(value) => handleToggleSetting(SETTING_KEYS.SOUNDS_ENABLED, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.paper}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Vibración habilitada</Text>
            <Switch
              value={settings[SETTING_KEYS.VIBRATION_ENABLED] ?? true}
              onValueChange={(value) => handleToggleSetting(SETTING_KEYS.VIBRATION_ENABLED, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.paper}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-iniciar siguiente</Text>
            <Switch
              value={settings[SETTING_KEYS.AUTO_START_NEXT] ?? false}
              onValueChange={(value) => handleToggleSetting(SETTING_KEYS.AUTO_START_NEXT, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.paper}
            />
          </View>
        </Card>

        {/* Stats Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.total_workouts || 0}</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round((user?.total_time || 0) / 60)}</Text>
              <Text style={styles.statLabel}>Minutos</Text>
            </View>
          </View>
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Datos</Text>

          <Button
            title="📊 Exportar Datos"
            onPress={handleExportData}
            variant="secondary"
            style={styles.actionButton}
          />

          <Button
            title="🗑️ Borrar Todos los Datos"
            onPress={handleResetData}
            variant="ghost"
            style={[styles.actionButton, styles.dangerButton]}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SetFit v1.0.0</Text>
          <Text style={styles.footerText}>Bloques. Ritmo. Resultado.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  backButton: {
    minWidth: 80,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    alignSelf: 'flex-start',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
  dangerButton: {
    borderColor: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});