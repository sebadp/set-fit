import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button } from '../common';
import { theme } from '../../constants/theme';
import {
  EXERCISE_CATEGORIES,
  DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
} from '../../models/routines';

export const CreateExerciseForm = ({
  onSave,
  onCancel,
  editingExercise = null,
  style,
}) => {
  const [exercise, setExercise] = useState({
    name: editingExercise?.name || '',
    category: editingExercise?.category || EXERCISE_CATEGORIES.STRENGTH,
    description: editingExercise?.description || '',
    exercise_type: editingExercise?.exercise_type || EXERCISE_TYPES.REP_BASED,
    default_duration: editingExercise?.default_duration || 30,
    default_reps: editingExercise?.default_reps || 12,
    default_sets: editingExercise?.default_sets || 3,
    rest_between_sets: editingExercise?.rest_between_sets || 60,
    difficulty: editingExercise?.difficulty || DIFFICULTY_LEVELS.BEGINNER,
    muscle_groups: editingExercise?.muscle_groups ? JSON.parse(editingExercise.muscle_groups) : [],
    equipment: editingExercise?.equipment ? JSON.parse(editingExercise.equipment) : [],
    instructions: editingExercise?.instructions || '',
  });

  const [muscleGroupInput, setMuscleGroupInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingExercise;

  const handleSave = async () => {
    if (!exercise.name.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio es requerido');
      return;
    }

    if (!exercise.description.trim()) {
      Alert.alert('Error', 'La descripción del ejercicio es requerida');
      return;
    }

    if (!exercise.instructions.trim()) {
      Alert.alert('Error', 'Las instrucciones del ejercicio son requeridas');
      return;
    }

    try {
      setSaving(true);

      const exerciseData = {
        ...exercise,
        muscle_groups: JSON.stringify(exercise.muscle_groups),
        equipment: JSON.stringify(exercise.equipment),
        is_default: 0, // Custom exercises are not default
      };

      await onSave(exerciseData);
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Error', 'No se pudo guardar el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  const addMuscleGroup = () => {
    if (muscleGroupInput.trim() && !exercise.muscle_groups.includes(muscleGroupInput.trim())) {
      setExercise(prev => ({
        ...prev,
        muscle_groups: [...prev.muscle_groups, muscleGroupInput.trim()],
      }));
      setMuscleGroupInput('');
    }
  };

  const removeMuscleGroup = (group) => {
    setExercise(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups.filter(g => g !== group),
    }));
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !exercise.equipment.includes(equipmentInput.trim())) {
      setExercise(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()],
      }));
      setEquipmentInput('');
    }
  };

  const removeEquipment = (item) => {
    setExercise(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== item),
    }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case EXERCISE_CATEGORIES.CARDIO:
        return '❤️';
      case EXERCISE_CATEGORIES.STRENGTH:
        return '💪';
      case EXERCISE_CATEGORIES.FLEXIBILITY:
        return '🤸';
      case EXERCISE_CATEGORIES.BALANCE:
        return '⚖️';
      case EXERCISE_CATEGORIES.CORE:
        return '🔥';
      case EXERCISE_CATEGORIES.HIIT:
        return '⚡';
      case EXERCISE_CATEGORIES.WARM_UP:
        return '🏁';
      case EXERCISE_CATEGORIES.COOL_DOWN:
        return '🧘';
      default:
        return '🏃';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case DIFFICULTY_LEVELS.BEGINNER:
        return theme.colors.success;
      case DIFFICULTY_LEVELS.INTERMEDIATE:
        return theme.colors.warning;
      case DIFFICULTY_LEVELS.ADVANCED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <Card style={[styles.container, style]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Ejercicio' : 'Crear Ejercicio Personalizado'}
          </Text>
          <Text style={styles.subtitle}>
            Diseña tu propio ejercicio con configuraciones personalizadas
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del ejercicio *</Text>
            <TextInput
              style={styles.textInput}
              value={exercise.name}
              onChangeText={(text) => setExercise(prev => ({ ...prev, name: text }))}
              placeholder="Ej: Push-ups modificados"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={exercise.description}
              onChangeText={(text) => setExercise(prev => ({ ...prev, description: text }))}
              placeholder="Descripción breve del ejercicio"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instrucciones detalladas *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={exercise.instructions}
              onChangeText={(text) => setExercise(prev => ({ ...prev, instructions: text }))}
              placeholder="Paso a paso de cómo realizar el ejercicio..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoryGrid}>
            {Object.values(EXERCISE_CATEGORIES).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  exercise.category === category && styles.categoryButtonSelected,
                ]}
                onPress={() => setExercise(prev => ({ ...prev, category }))}
              >
                <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    exercise.category === category && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de ejercicio</Text>
          <View style={styles.typeButtons}>
            {Object.values(EXERCISE_TYPES).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  exercise.exercise_type === type && styles.typeButtonSelected,
                ]}
                onPress={() => setExercise(prev => ({ ...prev, exercise_type: type }))}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    exercise.exercise_type === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {type === EXERCISE_TYPES.TIME_BASED && '⏱️ Por tiempo'}
                  {type === EXERCISE_TYPES.REP_BASED && '🔢 Por repeticiones'}
                  {type === EXERCISE_TYPES.DISTANCE_BASED && '📏 Por distancia'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores por defecto</Text>

          {exercise.exercise_type === EXERCISE_TYPES.TIME_BASED ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duración por defecto (segundos)</Text>
              <View style={styles.numberInput}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => setExercise(prev => ({
                    ...prev,
                    default_duration: Math.max(5, prev.default_duration - 5)
                  }))}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberValue}>{exercise.default_duration}s</Text>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => setExercise(prev => ({
                    ...prev,
                    default_duration: prev.default_duration + 5
                  }))}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repeticiones por defecto</Text>
              <View style={styles.numberInput}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => setExercise(prev => ({
                    ...prev,
                    default_reps: Math.max(1, prev.default_reps - 1)
                  }))}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberValue}>{exercise.default_reps} reps</Text>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => setExercise(prev => ({
                    ...prev,
                    default_reps: prev.default_reps + 1
                  }))}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Series por defecto</Text>
            <View style={styles.numberInput}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setExercise(prev => ({
                  ...prev,
                  default_sets: Math.max(1, prev.default_sets - 1)
                }))}
              >
                <Text style={styles.numberButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberValue}>{exercise.default_sets} sets</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setExercise(prev => ({
                  ...prev,
                  default_sets: prev.default_sets + 1
                }))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descanso entre series (segundos)</Text>
            <View style={styles.numberInput}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setExercise(prev => ({
                  ...prev,
                  rest_between_sets: Math.max(0, prev.rest_between_sets - 15)
                }))}
              >
                <Text style={styles.numberButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberValue}>{exercise.rest_between_sets}s</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setExercise(prev => ({
                  ...prev,
                  rest_between_sets: prev.rest_between_sets + 15
                }))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dificultad</Text>
          <View style={styles.difficultyButtons}>
            {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.difficultyButton,
                  exercise.difficulty === difficulty && {
                    backgroundColor: `${getDifficultyColor(difficulty)}20`,
                    borderColor: getDifficultyColor(difficulty),
                  },
                ]}
                onPress={() => setExercise(prev => ({ ...prev, difficulty }))}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    exercise.difficulty === difficulty && {
                      color: getDifficultyColor(difficulty),
                    },
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grupos musculares</Text>
          <View style={styles.inputGroup}>
            <View style={styles.tagInput}>
              <TextInput
                style={styles.tagTextInput}
                value={muscleGroupInput}
                onChangeText={setMuscleGroupInput}
                placeholder="Ej: chest, arms, core..."
                placeholderTextColor={theme.colors.textMuted}
                onSubmitEditing={addMuscleGroup}
              />
              <TouchableOpacity style={styles.addButton} onPress={addMuscleGroup}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.tagContainer}>
            {exercise.muscle_groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeMuscleGroup(group)}
              >
                <Text style={styles.tagText}>{group}</Text>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipamiento necesario</Text>
          <View style={styles.inputGroup}>
            <View style={styles.tagInput}>
              <TextInput
                style={styles.tagTextInput}
                value={equipmentInput}
                onChangeText={setEquipmentInput}
                placeholder="Ej: dumbbells, resistance band..."
                placeholderTextColor={theme.colors.textMuted}
                onSubmitEditing={addEquipment}
              />
              <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.tagContainer}>
            {exercise.equipment.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeEquipment(item)}
              >
                <Text style={styles.tagText}>{item}</Text>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            ))}
            {exercise.equipment.length === 0 && (
              <Text style={styles.noEquipmentText}>Sin equipamiento</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            onPress={onCancel}
            variant="ghost"
            style={styles.actionButton}
          />
          <Button
            title={saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Ejercicio')}
            onPress={handleSave}
            variant="primary"
            disabled={saving || !exercise.name.trim()}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  categoryTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  typeButtons: {
    gap: theme.spacing.sm,
  },
  typeButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  typeButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  typeButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  numberValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  difficultyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  tagTextInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  tagRemove: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  noEquipmentText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});