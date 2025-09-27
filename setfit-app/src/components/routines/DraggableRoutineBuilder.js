import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Card, Button } from '../common';
import { DraggableExerciseBlock } from './DraggableExerciseBlock';
import { theme } from '../../constants/theme';
import {
  BLOCK_TYPES,
  createEmptyBlock,
  calculateRoutineDuration,
  formatDuration,
} from '../../models/routines';

export const DraggableRoutineBuilder = ({
  blocks = [],
  onBlocksChange,
  onAddBlock,
  onEditBlock,
  style,
}) => {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(null);

  const handleDragEnd = useCallback(({ data }) => {
    // Update block order
    const updatedBlocks = data.map((block, index) => ({
      ...block,
      order: index,
    }));
    onBlocksChange?.(updatedBlocks);
  }, [onBlocksChange]);

  const handleUpdateBlockDuration = (index, newDuration) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      duration: newDuration,
    };
    onBlocksChange?.(updatedBlocks);
  };

  const handleUpdateBlockReps = (index, newReps) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      reps: newReps,
    };
    onBlocksChange?.(updatedBlocks);
  };

  const handleUpdateBlockSets = (index, newSets) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      sets: newSets,
    };
    onBlocksChange?.(updatedBlocks);
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
            const updatedBlocks = blocks.filter((_, i) => i !== index);
            onBlocksChange?.(updatedBlocks);
          },
        },
      ]
    );
  };

  const handleAddExerciseBlock = () => {
    onAddBlock?.(BLOCK_TYPES.EXERCISE);
  };

  const handleAddRestBlock = () => {
    const restBlock = createEmptyBlock(BLOCK_TYPES.REST);
    const updatedBlocks = [...blocks, restBlock];
    onBlocksChange?.(updatedBlocks);
  };

  const handleAddPreparationBlock = () => {
    const prepBlock = createEmptyBlock(BLOCK_TYPES.PREPARATION);
    const updatedBlocks = [...blocks, prepBlock];
    onBlocksChange?.(updatedBlocks);
  };

  const handleAddSetGroup = () => {
    const setGroupBlock = createEmptyBlock(BLOCK_TYPES.SET_GROUP);
    const updatedBlocks = [...blocks, setGroupBlock];
    onBlocksChange?.(updatedBlocks);
  };

  const totalDuration = calculateRoutineDuration(blocks);
  const exerciseCount = blocks.filter(block => block.type === BLOCK_TYPES.EXERCISE).length;

  const renderItem = ({ item, index, drag, isActive }) => (
    <ScaleDecorator>
      <DraggableExerciseBlock
        block={item}
        index={index}
        onEdit={onEditBlock}
        onDelete={handleDeleteBlock}
        onUpdateDuration={handleUpdateBlockDuration}
        onUpdateReps={handleUpdateBlockReps}
        onUpdateSets={handleUpdateBlockSets}
        drag={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>🎯 Constructor Vacío</Text>
      <Text style={styles.emptyDescription}>
        Agrega bloques de ejercicios, descansos o grupos de series para construir tu rutina.
        Puedes arrastrar y soltar para reordenar.
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="🏃 Agregar Ejercicio"
          onPress={handleAddExerciseBlock}
          variant="primary"
          size="small"
          style={styles.emptyButton}
        />
        <Button
          title="⏸️ Agregar Descanso"
          onPress={handleAddRestBlock}
          variant="secondary"
          size="small"
          style={styles.emptyButton}
        />
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={[styles.container, style]}>
      <Card style={styles.content}>
        {/* Header con estadísticas */}
        <View style={styles.header}>
          <Text style={styles.title}>Constructor de Rutina</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏱️ {formatDuration(totalDuration)}</Text>
              <Text style={styles.statLabel}>Duración Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏃 {exerciseCount}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>📋 {blocks.length}</Text>
              <Text style={styles.statLabel}>Bloques</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAdd}>
          <Text style={styles.quickAddTitle}>Agregar Bloque:</Text>
          <View style={styles.quickAddButtons}>
            <Button
              title="🏃"
              onPress={handleAddExerciseBlock}
              variant="primary"
              size="small"
              style={styles.quickButton}
            />
            <Button
              title="⏸️"
              onPress={handleAddRestBlock}
              variant="secondary"
              size="small"
              style={styles.quickButton}
            />
            <Button
              title="🏁"
              onPress={handleAddPreparationBlock}
              variant="ghost"
              size="small"
              style={styles.quickButton}
            />
            <Button
              title="🔄"
              onPress={handleAddSetGroup}
              variant="ghost"
              size="small"
              style={styles.quickButton}
            />
          </View>
        </View>

        {/* Draggable Blocks List */}
        <View style={styles.listContainer}>
          {blocks.length === 0 ? (
            <EmptyComponent />
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  Bloques de Entrenamiento ({blocks.length})
                </Text>
                <Text style={styles.listSubtitle}>
                  Mantén presionado y arrastra para reordenar
                </Text>
              </View>
              <DraggableFlatList
                data={blocks}
                onDragEnd={handleDragEnd}
                keyExtractor={(item, index) => `block-${item.id || index}`}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
              />
            </>
          )}
        </View>

        {/* Pro Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Consejos:</Text>
          <Text style={styles.tipText}>
            • Mantén presionado un bloque para arrastrarlo y reordenar
          </Text>
          <Text style={styles.tipText}>
            • Usa los controles + y - para ajustar rápidamente series y repeticiones
          </Text>
          <Text style={styles.tipText}>
            • Los grupos de series te permiten crear supersets y circuitos
          </Text>
        </View>
      </Card>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 0, // Remove Card's default padding
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  stats: {
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
  quickAdd: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  quickAddTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickButton: {
    minWidth: 50,
    aspectRatio: 1,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  listTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  listSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
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
  emptyActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  emptyButton: {
    minWidth: 140,
  },
  tipsContainer: {
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}05`,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tipsTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
});