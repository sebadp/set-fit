import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, Button } from '../components/common';
import { RoutineCard } from '../components/routines';
import { theme } from '../constants/theme';
import { useDatabase } from '../hooks/useDatabase';
import {
  ROUTINE_CATEGORIES,
  DIFFICULTY_LEVELS,
  getCategoryIcon,
} from '../models/routines';

export const RoutinesScreen = ({ onBack, onCreateRoutine, onEditRoutine, onPlayRoutine }) => {
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const { database } = useDatabase();

  // Load routines from database
  const loadRoutines = async () => {
    try {
      setLoading(true);
      const result = await database.getAllRoutines(1); // user_id = 1
      setRoutines(result);
      setFilteredRoutines(result);
    } catch (error) {
      console.error('Error loading routines:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutinas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter routines based on search and filters
  const filterRoutines = () => {
    let filtered = [...routines];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        routine =>
          routine.name.toLowerCase().includes(query) ||
          (routine.description && routine.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(routine => routine.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(routine => routine.difficulty === selectedDifficulty);
    }

    setFilteredRoutines(filtered);
  };

  // Handle routine actions
  const handlePlayRoutine = async (routine) => {
    try {
      // Update usage count and last used
      await database.updateRoutineUsage(routine.id);
      await loadRoutines(); // Refresh the list
      onPlayRoutine?.(routine);
    } catch (error) {
      console.error('Error updating routine usage:', error);
      onPlayRoutine?.(routine); // Still allow playing even if update fails
    }
  };

  const handleDuplicateRoutine = async (routine) => {
    try {
      const duplicatedRoutine = {
        ...routine,
        id: undefined, // Remove ID to create new routine
        name: `${routine.name} (Copia)`,
        is_template: 0, // Copies are not templates
        usage_count: 0,
        last_used: null,
      };

      await database.createRoutine(duplicatedRoutine);
      await loadRoutines();
      Alert.alert('✅ Éxito', 'Rutina duplicada correctamente');
    } catch (error) {
      console.error('Error duplicating routine:', error);
      Alert.alert('❌ Error', 'No se pudo duplicar la rutina');
    }
  };

  const handleDeleteRoutine = (routine) => {
    Alert.alert(
      '⚠️ Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar "${routine.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteRoutine(routine.id);
              await loadRoutines();
              Alert.alert('✅ Eliminada', 'Rutina eliminada correctamente');
            } catch (error) {
              console.error('Error deleting routine:', error);
              Alert.alert('❌ Error', 'No se pudo eliminar la rutina');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRoutines();
  };

  // Load routines on mount
  useEffect(() => {
    loadRoutines();
  }, []);

  // Apply filters when search or filters change
  useEffect(() => {
    filterRoutines();
  }, [searchQuery, selectedCategory, selectedDifficulty, routines]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Rutinas</Text>
          <View style={styles.headerActions}>
            {onCreateRoutine && (
              <Button
                title="+ Nueva"
                onPress={onCreateRoutine}
                variant="primary"
                size="small"
                style={styles.createButton}
              />
            )}
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
        </View>

        {/* Search and Filters */}
        <Card style={styles.filtersCard}>
          {/* Search */}
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar rutinas..."
            placeholderTextColor={theme.colors.textMuted}
          />

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                <Button
                  title="Todas"
                  onPress={() => setSelectedCategory('all')}
                  variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
                  size="small"
                  style={styles.filterButton}
                />
                {Object.values(ROUTINE_CATEGORIES).map(category => (
                  <Button
                    key={category}
                    title={`${getCategoryIcon(category)} ${category}`}
                    onPress={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? 'primary' : 'ghost'}
                    size="small"
                    style={styles.filterButton}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Difficulty Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Dificultad:</Text>
            <View style={styles.filterRow}>
              <Button
                title="Todas"
                onPress={() => setSelectedDifficulty('all')}
                variant={selectedDifficulty === 'all' ? 'primary' : 'ghost'}
                size="small"
                style={styles.filterButton}
              />
              {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
                <Button
                  key={difficulty}
                  title={difficulty}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  variant={selectedDifficulty === difficulty ? 'primary' : 'ghost'}
                  size="small"
                  style={styles.filterButton}
                />
              ))}
            </View>
          </View>
        </Card>

        {/* Results Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {filteredRoutines.length} rutina{filteredRoutines.length !== 1 ? 's' : ''} encontrada{filteredRoutines.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Routines List */}
        {filteredRoutines.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {routines.length === 0 ? '🏃 No tienes rutinas aún' : '🔍 No se encontraron rutinas'}
            </Text>
            <Text style={styles.emptyDescription}>
              {routines.length === 0
                ? 'Crea tu primera rutina personalizada o usa una de las plantillas disponibles.'
                : 'Prueba con otros términos de búsqueda o ajusta los filtros.'}
            </Text>
            {routines.length === 0 && onCreateRoutine && (
              <Button
                title="Crear Mi Primera Rutina"
                onPress={onCreateRoutine}
                variant="primary"
                style={styles.emptyAction}
              />
            )}
          </Card>
        ) : (
          filteredRoutines.map(routine => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onPress={() => onEditRoutine?.(routine)}
              onPlay={handlePlayRoutine}
              onEdit={() => onEditRoutine?.(routine)}
              onDuplicate={handleDuplicateRoutine}
              onDelete={!routine.is_template ? handleDeleteRoutine : undefined}
            />
          ))
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  createButton: {
    minWidth: 80,
  },
  backButton: {
    minWidth: 80,
  },
  filtersCard: {
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    minWidth: 60,
    textTransform: 'capitalize',
  },
  summary: {
    marginBottom: theme.spacing.lg,
  },
  summaryText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emptyAction: {
    minWidth: 200,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});