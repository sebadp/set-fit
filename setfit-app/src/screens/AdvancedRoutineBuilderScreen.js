import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Card, Button } from '../components/common';
import {
  DraggableRoutineBuilder,
  RoutinePreview,
  CreateExerciseForm,
} from '../components/routines';
import { theme } from '../constants/theme';
import { useRoutines, useExercises } from '../hooks/useDatabase';
import {
  ROUTINE_CATEGORIES,
  DIFFICULTY_LEVELS,
  BLOCK_TYPES,
  createEmptyRoutine,
  createEmptyBlock,
  calculateRoutineDuration,
  validateRoutine,
  getCategoryIcon,
} from '../models/routines';

const initialLayout = { width: Dimensions.get('window').width };

export const AdvancedRoutineBuilderScreen = ({
  onBack,
  onSave,
  editingRoutine = null,
  userId = 1,
}) => {
  const { createRoutine, updateRoutine } = useRoutines(userId);
  const { exercises, createExercise } = useExercises();

  // Form state
  const [routine, setRoutine] = useState(() =>
    editingRoutine || createEmptyRoutine(userId)
  );
  const [blocks, setBlocks] = useState(() => {
    try {
      return editingRoutine?.blocks_json ? JSON.parse(editingRoutine.blocks_json) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState('');

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  const [tabRoutes] = useState([
    { key: 'info', title: 'Info' },
    { key: 'builder', title: 'Constructor' },
    { key: 'preview', title: 'Vista Previa' },
  ]);

  const isEditing = !!editingRoutine;

  // Update total duration when blocks change
  useEffect(() => {
    const totalDuration = calculateRoutineDuration(blocks);
    setRoutine(prev => ({ ...prev, total_duration: totalDuration }));
  }, [blocks]);

  // Filtered exercises for selector
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseFilter.toLowerCase()) ||
    exercise.category.toLowerCase().includes(exerciseFilter.toLowerCase())
  );

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate routine
      const routineToValidate = {
        ...routine,
        blocks_json: JSON.stringify(blocks),
      };

      const validation = validateRoutine(routineToValidate);
      if (!validation.isValid) {
        Alert.alert('❌ Error de Validación', validation.errors.join('\n'));
        return;
      }

      const routineData = {
        ...routine,
        blocks_json: JSON.stringify(blocks),
        total_duration: calculateRoutineDuration(blocks),
      };

      if (isEditing) {
        await updateRoutine(routine.id, routineData);
        Alert.alert('✅ Éxito', 'Rutina actualizada correctamente');
      } else {
        const routineId = await createRoutine(routineData);
        Alert.alert('✅ Éxito', 'Rutina creada correctamente');
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('❌ Error', 'No se pudo guardar la rutina');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = (type) => {
    if (type === BLOCK_TYPES.EXERCISE) {
      setShowExerciseSelector(true);
    } else {
      const newBlock = createEmptyBlock(type);
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleSelectExercise = (exercise) => {
    const newBlock = createEmptyBlock(BLOCK_TYPES.EXERCISE);
    newBlock.exercise_name = exercise.name;
    newBlock.exercise_type = exercise.exercise_type;
    newBlock.duration = exercise.default_duration;
    newBlock.reps = exercise.default_reps;
    newBlock.sets = exercise.default_sets;
    newBlock.rest_between_sets = exercise.rest_between_sets;

    setBlocks(prev => [...prev, newBlock]);
    setShowExerciseSelector(false);
    setExerciseFilter('');
  };

  const handleEditBlock = (index) => {
    const block = blocks[index];
    if (block.type === BLOCK_TYPES.EXERCISE) {
      setShowExerciseSelector(true);
    }
  };

  const handleCreateExercise = async (exerciseData) => {
    try {
      await createExercise(exerciseData);
      setShowCreateExercise(false);
      Alert.alert('✅ Éxito', 'Ejercicio creado correctamente');
    } catch (error) {
      console.error('Error creating exercise:', error);
      Alert.alert('❌ Error', 'No se pudo crear el ejercicio');
    }
  };

  const handleStartWorkout = (routine, blocks) => {
    Alert.alert(
      '🚀 Comenzar Entrenamiento',
      '¿Quieres empezar esta rutina ahora?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Empezar',
          onPress: () => {
            // Here you would navigate to workout execution screen
            Alert.alert('🏃 ¡Entrenamiento iniciado!', 'Funcionalidad próximamente...');
          },
        },
      ]
    );
  };

  // Tab Scenes
  const InfoScene = () => (
    <View style={styles.tabContent}>
      <Card style={styles.infoCard}>
        {/* Header */}
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>
            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
          </Text>
          <Text style={styles.infoSubtitle}>
            Configura la información básica de tu rutina
          </Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la rutina *</Text>
            <TextInput
              style={styles.textInput}
              value={routine.name}
              onChangeText={(text) => setRoutine(prev => ({ ...prev, name: text }))}
              placeholder="Ej: Mi rutina HIIT personalizada"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={routine.description}
              onChangeText={(text) => setRoutine(prev => ({ ...prev, description: text }))}
              placeholder="Describe tu rutina..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoryGrid}>
              {Object.values(ROUTINE_CATEGORIES).map(category => (
                <Button
                  key={category}
                  title={`${getCategoryIcon(category)} ${category}`}
                  onPress={() => setRoutine(prev => ({ ...prev, category }))}
                  variant={routine.category === category ? 'primary' : 'ghost'}
                  size="small"
                  style={styles.categoryButton}
                />
              ))}
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dificultad</Text>
            <View style={styles.difficultyRow}>
              {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
                <Button
                  key={difficulty}
                  title={difficulty}
                  onPress={() => setRoutine(prev => ({ ...prev, difficulty }))}
                  variant={routine.difficulty === difficulty ? 'primary' : 'ghost'}
                  size="small"
                  style={styles.difficultyButton}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Stats Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏱️ {Math.floor(routine.total_duration / 60)}m</Text>
              <Text style={styles.statLabel}>Duración</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏃 {blocks.filter(b => b.type === BLOCK_TYPES.EXERCISE).length}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>📋 {blocks.length}</Text>
              <Text style={styles.statLabel}>Bloques</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  const BuilderScene = () => (
    <View style={styles.tabContent}>
      <DraggableRoutineBuilder
        blocks={blocks}
        onBlocksChange={setBlocks}
        onAddBlock={handleAddBlock}
        onEditBlock={handleEditBlock}
      />
    </View>
  );

  const PreviewScene = () => (
    <View style={styles.tabContent}>
      <RoutinePreview
        routine={routine}
        blocks={blocks}
        onStartWorkout={handleStartWorkout}
      />
    </View>
  );

  const renderScene = SceneMap({
    info: InfoScene,
    builder: BuilderScene,
    preview: PreviewScene,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.textMuted}
    />
  );

  // Exercise Selector Modal-like View
  if (showExerciseSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Card style={styles.selectorCard}>
          {/* Header */}
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>Seleccionar Ejercicio</Text>
            <View style={styles.selectorActions}>
              <Button
                title="+ Crear"
                onPress={() => {
                  setShowExerciseSelector(false);
                  setShowCreateExercise(true);
                }}
                variant="secondary"
                size="small"
              />
              <Button
                title="← Volver"
                onPress={() => {
                  setShowExerciseSelector(false);
                  setExerciseFilter('');
                }}
                variant="ghost"
                size="small"
              />
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              value={exerciseFilter}
              onChangeText={setExerciseFilter}
              placeholder="Buscar ejercicios..."
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {filteredExercises.map(exercise => (
              <Card
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleSelectExercise(exercise)}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCategory}>
                    {exercise.category} • {exercise.difficulty}
                  </Text>
                </View>
                {exercise.description && (
                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>
                )}
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseDetail}>
                    {exercise.exercise_type === 'rep_based'
                      ? `${exercise.default_reps} reps`
                      : `${exercise.default_duration}s`}
                  </Text>
                  <Text style={styles.exerciseDetail}>
                    {exercise.default_sets} sets
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </Card>
      </SafeAreaView>
    );
  }

  // Create Exercise Modal-like View
  if (showCreateExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <CreateExerciseForm
          onSave={handleCreateExercise}
          onCancel={() => setShowCreateExercise(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Constructor Avanzado</Text>
        <View style={styles.headerActions}>
          <Button
            title={saving ? 'Guardando...' : 'Guardar'}
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={saving || routine.name.trim() === ''}
          />
          {onBack && (
            <Button
              title="← Volver"
              onPress={onBack}
              variant="ghost"
              size="small"
            />
          )}
        </View>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index: tabIndex, routes: tabRoutes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setTabIndex}
        initialLayout={initialLayout}
        style={styles.tabView}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabIndicator: {
    backgroundColor: theme.colors.primary,
    height: 3,
  },
  tabLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  infoCard: {
    flex: 1,
  },
  infoHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    minWidth: '30%',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficultyButton: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  // Exercise Selector Styles
  selectorCard: {
    flex: 1,
    margin: theme.spacing.lg,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectorTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  selectorActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  searchSection: {
    padding: theme.spacing.lg,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  exerciseCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  exerciseHeader: {
    marginBottom: theme.spacing.xs,
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  exerciseCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  exerciseDetail: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});