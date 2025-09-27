import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, Button } from '../components/common';
import { theme } from '../constants/theme';
import { useRoutines, useExercises } from '../hooks/useDatabase';
import {
  ROUTINE_CATEGORIES,
  DIFFICULTY_LEVELS,
  BLOCK_TYPES,
  createEmptyRoutine,
  calculateRoutineDuration,
  validateRoutine,
  formatDuration,
  getCategoryIcon,
  getDifficultyColor,
} from '../models/routines';

export const CreateRoutineScreen = ({
  onBack,
  onSave,
  editingRoutine = null,
  userId = 1
}) => {
  const { createRoutine, updateRoutine } = useRoutines(userId);
  const { exercises } = useExercises();

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
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);
  const [exerciseFilter, setExerciseFilter] = useState('');

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

  const handleAddBlock = (type = BLOCK_TYPES.EXERCISE) => {
    if (type === BLOCK_TYPES.EXERCISE) {
      setSelectedBlockIndex(blocks.length);
      setShowExerciseSelector(true);
    } else {
      const newBlock = {
        id: Date.now(),
        type,
        exercise_name: type === BLOCK_TYPES.REST ? 'Descanso' : 'Preparación',
        duration: type === BLOCK_TYPES.REST ? 30 : 60,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleSelectExercise = (exercise) => {
    const newBlock = {
      id: Date.now(),
      type: BLOCK_TYPES.EXERCISE,
      exercise_name: exercise.name,
      duration: exercise.default_duration,
    };

    if (selectedBlockIndex !== null && selectedBlockIndex < blocks.length) {
      // Replace existing block
      const newBlocks = [...blocks];
      newBlocks[selectedBlockIndex] = newBlock;
      setBlocks(newBlocks);
    } else {
      // Add new block
      setBlocks(prev => [...prev, newBlock]);
    }

    setShowExerciseSelector(false);
    setSelectedBlockIndex(null);
    setExerciseFilter('');
  };

  const handleEditBlock = (index) => {
    setSelectedBlockIndex(index);
    setShowExerciseSelector(true);
  };

  const handleDeleteBlock = (index) => {
    Alert.alert(
      '⚠️ Eliminar Bloque',
      '¿Estás seguro de que quieres eliminar este bloque?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setBlocks(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleMoveBlock = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const handleUpdateBlockDuration = (index, duration) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], duration: Math.max(5, duration) };
    setBlocks(newBlocks);
  };

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

  const getBlockIcon = (type) => {
    switch (type) {
      case BLOCK_TYPES.EXERCISE:
        return '🏃';
      case BLOCK_TYPES.REST:
        return '⏸️';
      case BLOCK_TYPES.PREPARATION:
        return '🏁';
      default:
        return '▶️';
    }
  };

  const getBlockColor = (type) => {
    switch (type) {
      case BLOCK_TYPES.EXERCISE:
        return theme.colors.primary;
      case BLOCK_TYPES.REST:
        return theme.colors.warning;
      case BLOCK_TYPES.PREPARATION:
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (showExerciseSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Ejercicio</Text>
            <Button
              title="← Volver"
              onPress={() => {
                setShowExerciseSelector(false);
                setSelectedBlockIndex(null);
                setExerciseFilter('');
              }}
              variant="ghost"
              size="small"
            />
          </View>

          {/* Search */}
          <Card style={styles.searchCard}>
            <TextInput
              style={styles.searchInput}
              value={exerciseFilter}
              onChangeText={setExerciseFilter}
              placeholder="Buscar ejercicios..."
              placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          {/* Exercise List */}
          {filteredExercises.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => handleSelectExercise(exercise)}
              activeOpacity={0.8}
            >
              <Card style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDuration}>
                    {formatDuration(exercise.default_duration)}
                  </Text>
                </View>
                <Text style={styles.exerciseCategory}>
                  {exercise.category} • {exercise.difficulty}
                </Text>
                {exercise.description && (
                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
          </Text>
          <View style={styles.headerActions}>
            <Button
              title={saving ? 'Guardando...' : 'Guardar'}
              onPress={handleSave}
              variant="primary"
              size="small"
              disabled={saving || routine.name.trim() === ''}
              style={styles.saveButton}
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

        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la rutina *</Text>
            <TextInput
              style={styles.textInput}
              value={routine.name}
              onChangeText={(text) => setRoutine(prev => ({ ...prev, name: text }))}
              placeholder="Ej: Mi rutina HIIT"
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {Object.values(ROUTINE_CATEGORIES).map(category => (
                  <Button
                    key={category}
                    title={`${getCategoryIcon(category)} ${category}`}
                    onPress={() => setRoutine(prev => ({ ...prev, category }))}
                    variant={routine.category === category ? 'primary' : 'ghost'}
                    size="small"
                    style={styles.filterButton}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dificultad</Text>
            <View style={styles.filterRow}>
              {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
                <Button
                  key={difficulty}
                  title={difficulty}
                  onPress={() => setRoutine(prev => ({ ...prev, difficulty }))}
                  variant={routine.difficulty === difficulty ? 'primary' : 'ghost'}
                  size="small"
                  style={styles.filterButton}
                />
              ))}
            </View>
          </View>
        </Card>

        {/* Routine Stats */}
        <Card style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏱️ {formatDuration(routine.total_duration)}</Text>
              <Text style={styles.statLabel}>Duración Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏃 {blocks.length}</Text>
              <Text style={styles.statLabel}>Bloques</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                💪 {blocks.filter(b => b.type === BLOCK_TYPES.EXERCISE).length}
              </Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
          </View>
        </Card>

        {/* Blocks */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bloques de Entrenamiento</Text>
            <Text style={styles.sectionSubtitle}>
              Arrastra para reordenar, toca para editar
            </Text>
          </View>

          {/* Add Block Buttons */}
          <View style={styles.addBlockSection}>
            <Button
              title="🏃 Ejercicio"
              onPress={() => handleAddBlock(BLOCK_TYPES.EXERCISE)}
              variant="primary"
              size="small"
              style={styles.addButton}
            />
            <Button
              title="⏸️ Descanso"
              onPress={() => handleAddBlock(BLOCK_TYPES.REST)}
              variant="secondary"
              size="small"
              style={styles.addButton}
            />
            <Button
              title="🏁 Preparación"
              onPress={() => handleAddBlock(BLOCK_TYPES.PREPARATION)}
              variant="ghost"
              size="small"
              style={styles.addButton}
            />
          </View>

          {/* Blocks List */}
          {blocks.length === 0 ? (
            <View style={styles.emptyBlocks}>
              <Text style={styles.emptyTitle}>🎯 Rutina Vacía</Text>
              <Text style={styles.emptyDescription}>
                Agrega bloques de ejercicio, descanso o preparación para crear tu rutina.
              </Text>
            </View>
          ) : (
            blocks.map((block, index) => (
              <View key={block.id || index} style={styles.blockCard}>
                <View style={styles.blockHeader}>
                  <View style={styles.blockInfo}>
                    <View style={styles.blockTitleRow}>
                      <Text style={styles.blockIcon}>{getBlockIcon(block.type)}</Text>
                      <Text style={styles.blockName}>{block.exercise_name}</Text>
                      <View
                        style={[
                          styles.blockTypeBadge,
                          { backgroundColor: `${getBlockColor(block.type)}20` }
                        ]}
                      >
                        <Text
                          style={[
                            styles.blockTypeText,
                            { color: getBlockColor(block.type) }
                          ]}
                        >
                          {block.type}
                        </Text>
                      </View>
                    </View>

                    {/* Duration Input */}
                    <View style={styles.durationRow}>
                      <Text style={styles.durationLabel}>Duración:</Text>
                      <View style={styles.durationControls}>
                        <TouchableOpacity
                          onPress={() => handleUpdateBlockDuration(index, block.duration - 5)}
                          style={styles.durationButton}
                        >
                          <Text style={styles.durationButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.durationValue}>
                          {formatDuration(block.duration)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleUpdateBlockDuration(index, block.duration + 5)}
                          style={styles.durationButton}
                        >
                          <Text style={styles.durationButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Block Actions */}
                  <View style={styles.blockActions}>
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={() => handleMoveBlock(index, index - 1)}
                        style={styles.moveButton}
                      >
                        <Text style={styles.moveButtonText}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < blocks.length - 1 && (
                      <TouchableOpacity
                        onPress={() => handleMoveBlock(index, index + 1)}
                        style={styles.moveButton}
                      >
                        <Text style={styles.moveButtonText}>↓</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEditBlock(index)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteBlock(index)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  saveButton: {
    minWidth: 100,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
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
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    minWidth: 80,
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
  addBlockSection: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    flex: 1,
  },
  emptyBlocks: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  blockCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  blockInfo: {
    flex: 1,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  blockIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  blockName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
  blockTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  blockTypeText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  durationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  durationValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  blockActions: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  moveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 12,
  },
  // Exercise Selector Styles
  searchCard: {
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
  },
  exerciseCard: {
    marginBottom: theme.spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
  exerciseDuration: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  exerciseCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: theme.spacing.xs,
  },
  exerciseDescription: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
});