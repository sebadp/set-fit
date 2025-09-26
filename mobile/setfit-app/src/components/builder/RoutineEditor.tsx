import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { Screen } from '@/components/layout/Screen';
import { useRoutineBuilder } from '@/hooks/useRoutineBuilder';
import { useRoutineStore } from '@/stores/routineStore';
import { Routine, RoutineBlock } from '@/types/routine';
import { useTheme } from '@/theme/ThemeProvider';

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} min`;
};

type RoutineEditorProps = {
  initialRoutine?: Routine;
  mode: 'create' | 'edit';
};

export const RoutineEditor = ({ initialRoutine, mode }: RoutineEditorProps) => {
  const theme = useTheme();
  const router = useRouter();
  const addRoutine = useRoutineStore((state) => state.addRoutine);
  const updateRoutine = useRoutineStore((state) => state.updateRoutine);
  const builder = useRoutineBuilder(initialRoutine);
  const [isSaving, setIsSaving] = React.useState(false);

  const selectedPrimaryBlock = React.useMemo(() => {
    if (builder.selectedBlockIds.length === 0) {
      return null;
    }
    const [firstId] = builder.selectedBlockIds;
    return builder.blocks.find((block) => block.id === firstId) ?? null;
  }, [builder.blocks, builder.selectedBlockIds]);

  const handleSave = async () => {
    if (builder.blocks.length === 0) {
      Alert.alert('Agregá bloques', 'Necesitás al menos un bloque de ejercicio o descanso para guardar la rutina.');
      return;
    }
    try {
      setIsSaving(true);
      const payload = builder.buildRoutinePayload();
      if (mode === 'create') {
        await addRoutine(payload);
      } else {
        await updateRoutine(payload);
      }
      router.back();
    } catch (error) {
      Alert.alert('No pudimos guardar', error instanceof Error ? error.message : 'Intentá nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderItem = React.useCallback(
    ({ item, drag, isActive }: RenderItemParams<RoutineBlock>) => {
      const isSelected = builder.selectedBlockIds.includes(item.id);
      const group = item.groupId ? builder.groups.find((g) => g.id === item.groupId) : undefined;
      const baseColor = item.type === 'exercise' ? theme.colors.accent : theme.colors.rest;
      const borderColor = isSelected ? baseColor : theme.colors.border;
      const backgroundColor = isSelected
        ? `${baseColor}1A`
        : theme.colorScheme === 'light'
          ? 'rgba(17,24,39,0.04)'
          : 'rgba(255,255,255,0.06)';

      return (
        <Pressable
          key={item.id}
          onPress={() => builder.toggleBlockSelection(item.id)}
          onLongPress={drag}
          disabled={isActive}
          style={[styles.blockCard, { borderColor, backgroundColor }]}
        >
          <View style={styles.blockHeader}>
            <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            <View style={styles.blockMeta}>
              <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>
                {item.type === 'exercise' ? 'Ejercicio' : 'Descanso'} · {Math.round(item.durationSec)} s
              </Text>
            </View>
          </View>
          {group ? (
            <View style={[styles.groupBadge, { borderColor: baseColor, backgroundColor: `${baseColor}22` }]}
              accessibilityRole="text"
            >
              <Text style={[theme.textVariants.caption, { color: baseColor }]}>Serie ×{group.repetitions}</Text>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [builder, theme],
  );

  const handleDecreaseDuration = (block: RoutineBlock) => {
    const next = Math.max(5, block.durationSec - 5);
    builder.updateBlock(block.id, { durationSec: next });
  };

  const handleIncreaseDuration = (block: RoutineBlock) => {
    const next = block.durationSec + 5;
    builder.updateBlock(block.id, { durationSec: next });
  };

  const handleToggleType = (block: RoutineBlock, type: RoutineBlock['type']) => {
    if (block.type === type) {
      return;
    }
    builder.updateBlock(block.id, { type });
  };

  const selectedGroup = builder.selectedGroup;

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}> 
          <View style={styles.headerText}>
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>
              {mode === 'create' ? 'Nueva rutina' : 'Editar rutina'}
            </Text>
            <TextInput
              value={builder.name}
              onChangeText={builder.setName}
              placeholder="Nombre de la rutina"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.titleInput, { color: theme.colors.textPrimary }]}
            />
            <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Duración estimada {formatSeconds(builder.totalDurationSec)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.colors.accent, opacity: isSaving ? 0.5 : 1 }]}
          >
            <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>{isSaving ? 'Guardando…' : 'Guardar'}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
          <View style={[styles.section, { borderColor: theme.colors.border }]}>
            {builder.blocks.length === 0 ? (
              <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Agregá tu primer bloque para comenzar.</Text>
            ) : (
              <DraggableFlatList
                data={builder.blocks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                onDragEnd={({ from, to }) => builder.moveBlock(from, to)}
                contentContainerStyle={{ gap: theme.spacing.md }}
                activationDistance={8}
                scrollEnabled={false}
              />
            )}
          </View>

          {selectedPrimaryBlock ? (
            <View style={[styles.section, { borderColor: theme.colors.border }]}
              accessibilityRole="adjustable"
            >
              <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Bloque seleccionado</Text>
              <TextInput
                value={selectedPrimaryBlock.name}
                onChangeText={(text) => builder.updateBlock(selectedPrimaryBlock.id, { name: text })}
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
                placeholder="Nombre del bloque"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={styles.durationRow}>
                <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Duración</Text>
                <View style={styles.durationControls}>
                  <Pressable style={[styles.smallButton, { borderColor: theme.colors.border }]} onPress={() => handleDecreaseDuration(selectedPrimaryBlock)}>
                    <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>-</Text>
                  </Pressable>
                  <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>{selectedPrimaryBlock.durationSec}s</Text>
                  <Pressable style={[styles.smallButton, { borderColor: theme.colors.border }]} onPress={() => handleIncreaseDuration(selectedPrimaryBlock)}>
                    <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>+</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.typeToggleRow}>
                <Pressable
                  style={[styles.typeChip, {
                    borderColor: theme.colors.border,
                    backgroundColor: selectedPrimaryBlock.type === 'exercise' ? `${theme.colors.accent}22` : 'transparent',
                  }]}
                  onPress={() => handleToggleType(selectedPrimaryBlock, 'exercise')}
                >
                  <Text style={[theme.textVariants.caption, { color: theme.colors.textPrimary }]}>Ejercicio</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeChip, {
                    borderColor: theme.colors.border,
                    backgroundColor: selectedPrimaryBlock.type === 'rest' ? `${theme.colors.rest}22` : 'transparent',
                  }]}
                  onPress={() => handleToggleType(selectedPrimaryBlock, 'rest')}
                >
                  <Text style={[theme.textVariants.caption, { color: theme.colors.textPrimary }]}>Descanso</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeChip, { borderColor: theme.colors.border }]}
                  onPress={() => builder.removeSelectedBlocks()}
                >
                  <Text style={[theme.textVariants.caption, { color: theme.colors.alert }]}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {builder.selectedBlockIds.length > 0 ? (
            <View style={[styles.section, { borderColor: theme.colors.border }]}
              accessibilityRole="toolbar"
            >
              <View style={styles.selectionHeader}>
                <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Seleccionados</Text>
                <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>{builder.selectedBlockIds.length} bloques</Text>
              </View>

              {selectedGroup ? (
                <View style={styles.seriesControls}>
                  <Text style={[theme.textVariants.body, { color: theme.colors.textSecondary }]}>Serie x{selectedGroup.repetitions}</Text>
                  <View style={styles.seriesButtons}>
                    <Pressable
                      style={[styles.smallButton, { borderColor: theme.colors.border }]}
                      onPress={() => builder.updateSeries(selectedGroup.id, Math.max(1, selectedGroup.repetitions - 1))}
                    >
                      <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>-</Text>
                    </Pressable>
                    <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>{selectedGroup.repetitions}</Text>
                    <Pressable
                      style={[styles.smallButton, { borderColor: theme.colors.border }]}
                      onPress={() => builder.updateSeries(selectedGroup.id, selectedGroup.repetitions + 1)}
                    >
                      <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={[styles.typeChip, { borderColor: theme.colors.border }]}
                    onPress={() => builder.clearSeries(selectedGroup.id)}
                  >
                    <Text style={[theme.textVariants.caption, { color: theme.colors.alert }]}>Quitar serie</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[styles.primaryAction, { backgroundColor: theme.colors.rest }]}
                  onPress={() => builder.createSeriesFromSelection(3)}
                >
                  <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>Crear serie x3</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.secondaryAction, { borderColor: theme.colors.border }]}
                onPress={builder.clearSelection}
              >
                <Text style={[theme.textVariants.caption, { color: theme.colors.textSecondary }]}>Limpiar selección</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.toolbar}>
            <Pressable
              style={[styles.primaryAction, { backgroundColor: theme.colors.accent }]}
              onPress={() => builder.addBlock('exercise')}
            >
              <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>Añadir ejercicio</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryAction, { backgroundColor: theme.colors.rest }]}
              onPress={() => builder.addBlock('rest')}
            >
              <Text style={[theme.textVariants.button, { color: theme.colors.background }]}>Añadir descanso</Text>
            </Pressable>
          </View>

          <View style={[styles.section, { borderColor: theme.colors.border }]}
            accessibilityRole="text"
          >
            <Text style={[theme.textVariants.cardTitle, { color: theme.colors.textPrimary }]}>Notas</Text>
            <TextInput
              value={builder.note}
              onChangeText={builder.setNote}
              style={[styles.noteInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="Detalle brevemente el foco de esta rutina"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },
  section: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  blockCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  blockHeader: {
    gap: 6,
  },
  blockMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seriesControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  seriesButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryAction: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
