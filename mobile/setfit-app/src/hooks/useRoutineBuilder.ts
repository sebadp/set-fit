import { useCallback, useMemo, useState } from 'react';

import { Routine, RoutineBlock, RoutineGroup } from '@/types/routine';
import { generateId } from '@/utils/id';

const normalizeBlocks = (items: RoutineBlock[]) =>
  items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({ ...block, order: index }));

const moveInArray = (items: RoutineBlock[], from: number, to: number) => {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return normalizeBlocks(next);
};

const ensureGroupsHaveBlocks = (blocks: RoutineBlock[], groups: RoutineGroup[]) => {
  const usedGroupIds = new Set(blocks.filter((block) => block.groupId).map((block) => block.groupId as string));
  return groups.filter((group) => usedGroupIds.has(group.id));
};

export type RoutineBuilderAPI = {
  routineId: string;
  name: string;
  note: string;
  blocks: RoutineBlock[];
  groups: RoutineGroup[];
  selectedBlockIds: string[];
  createdAt: string;
  isDirty: boolean;
  setName: (value: string) => void;
  setNote: (value: string) => void;
  addBlock: (type: RoutineBlock['type']) => void;
  updateBlock: (blockId: string, payload: Partial<Pick<RoutineBlock, 'name' | 'durationSec' | 'type'>>) => void;
  moveBlock: (from: number, to: number) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearSelection: () => void;
  removeSelectedBlocks: () => void;
  createSeriesFromSelection: (repetitions: number) => void;
  updateSeries: (groupId: string, repetitions: number) => void;
  clearSeries: (groupId: string) => void;
  selectedGroup: RoutineGroup | null;
  totalDurationSec: number;
  buildRoutinePayload: () => Routine;
};

export const useRoutineBuilder = (initialRoutine?: Routine): RoutineBuilderAPI => {
  const [routineId] = useState(initialRoutine?.id ?? generateId('routine'));
  const [nameValue, setNameValue] = useState(initialRoutine?.name ?? 'Nueva rutina');
  const [noteValue, setNoteValue] = useState(initialRoutine?.note ?? '');
  const [blocks, setBlocks] = useState<RoutineBlock[]>(() => normalizeBlocks(initialRoutine?.blocks ?? []));
  const [groups, setGroups] = useState<RoutineGroup[]>(() => initialRoutine?.groups ?? []);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(() => !initialRoutine);

  const createdAt = initialRoutine?.createdAt ?? new Date().toISOString();

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const addBlock = useCallback(
    (type: RoutineBlock['type']) => {
      markDirty();
      setBlocks((current) =>
        normalizeBlocks([
          ...current,
          {
            id: generateId('block'),
            routineId,
            name: type === 'exercise' ? 'Nuevo ejercicio' : 'Descanso',
            type,
            durationSec: type === 'exercise' ? 45 : 20,
            order: current.length,
          },
        ]),
      );
    },
    [markDirty, routineId],
  );

  const updateBlock = useCallback(
    (blockId: string, payload: Partial<Pick<RoutineBlock, 'name' | 'durationSec' | 'type'>>) => {
      markDirty();
      setBlocks((current) =>
        normalizeBlocks(
          current.map((block) => (block.id === blockId ? { ...block, ...payload } : block)),
        ),
      );
    },
    [markDirty],
  );

  const moveBlock = useCallback(
    (from: number, to: number) => {
      if (from === to) {
        return;
      }
      markDirty();
      setBlocks((current) => moveInArray(current, from, to));
    },
    [markDirty],
  );

  const toggleBlockSelection = useCallback((blockId: string) => {
    setSelectedBlockIds((current) =>
      current.includes(blockId) ? current.filter((id) => id !== blockId) : [...current, blockId],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBlockIds([]);
  }, []);

  const removeSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.length === 0) {
      return;
    }
    markDirty();
    const selectedSet = new Set(selectedBlockIds);
    let nextBlocks: RoutineBlock[] = [];
    setBlocks((current) => {
      nextBlocks = normalizeBlocks(current.filter((block) => !selectedSet.has(block.id)));
      return nextBlocks;
    });
    setGroups((current) => ensureGroupsHaveBlocks(nextBlocks, current));
    setSelectedBlockIds([]);
  }, [markDirty, selectedBlockIds]);

  const createSeriesFromSelection = useCallback(
    (repetitions: number) => {
      if (selectedBlockIds.length === 0) {
        return;
      }
      markDirty();
      const groupId = generateId('group');
      const selectedSet = new Set(selectedBlockIds);
      let nextBlocks: RoutineBlock[] = [];
      setBlocks((current) => {
        nextBlocks = normalizeBlocks(
          current.map((block) => (selectedSet.has(block.id) ? { ...block, groupId } : block)),
        );
        return nextBlocks;
      });
      setGroups((current) => {
        const cleaned = ensureGroupsHaveBlocks(nextBlocks, current);
        return [
          ...cleaned,
          {
            id: groupId,
            routineId,
            label: `Serie ${cleaned.length + 1}`,
            repetitions,
          },
        ];
      });
    },
    [markDirty, routineId, selectedBlockIds],
  );

  const updateSeries = useCallback(
    (groupId: string, repetitions: number) => {
      markDirty();
      setGroups((current) => current.map((group) => (group.id === groupId ? { ...group, repetitions } : group)));
    },
    [markDirty],
  );

  const clearSeries = useCallback(
    (groupId: string) => {
      markDirty();
      let nextBlocks: RoutineBlock[] = [];
      setBlocks((current) => {
        nextBlocks = normalizeBlocks(
          current.map((block) => (block.groupId === groupId ? { ...block, groupId: undefined } : block)),
        );
        return nextBlocks;
      });
      setGroups((current) => ensureGroupsHaveBlocks(nextBlocks, current));
      const validIds = new Set(nextBlocks.map((block) => block.id));
      setSelectedBlockIds((current) => current.filter((id) => validIds.has(id)));
    },
    [markDirty],
  );

  const selectedGroup = useMemo(() => {
    if (selectedBlockIds.length === 0) {
      return null;
    }
    const groupIds = new Set<string>();
    for (const id of selectedBlockIds) {
      const block = blocks.find((item) => item.id === id);
      if (!block?.groupId) {
        return null;
      }
      groupIds.add(block.groupId);
      if (groupIds.size > 1) {
        return null;
      }
    }
    const [targetGroupId] = Array.from(groupIds);
    return groups.find((group) => group.id === targetGroupId) ?? null;
  }, [blocks, groups, selectedBlockIds]);

  const totalDurationSec = useMemo(() => {
    const groupedIds = new Set<string>();
    let total = 0;

    for (const group of groups) {
      const groupBlocks = blocks.filter((block) => block.groupId === group.id);
      if (groupBlocks.length === 0) {
        continue;
      }
      const groupTotal = groupBlocks.reduce((acc, block) => acc + block.durationSec, 0);
      total += groupTotal * group.repetitions;
      groupBlocks.forEach((block) => groupedIds.add(block.id));
    }

    for (const block of blocks) {
      if (!groupedIds.has(block.id)) {
        total += block.durationSec;
      }
    }

    return total;
  }, [blocks, groups]);

  const buildRoutinePayload = useCallback((): Routine => {
    const normalizedBlocks = normalizeBlocks(
      blocks.map((block) => ({
        ...block,
        routineId,
      })),
    );

    const normalizedGroups = groups.map((group) => ({
      ...group,
      routineId,
    }));

    const nowIso = new Date().toISOString();

    return {
      id: routineId,
      name: nameValue.trim() || 'Rutina sin nombre',
      note: noteValue.trim() ? noteValue.trim() : undefined,
      totalDurationSec,
      createdAt,
      updatedAt: nowIso,
      blocks: normalizedBlocks,
      groups: normalizedGroups,
    };
  }, [blocks, createdAt, groups, nameValue, noteValue, routineId, totalDurationSec]);

  const setName = useCallback(
    (value: string) => {
      markDirty();
      setNameValue(value);
    },
    [markDirty],
  );

  const setNote = useCallback(
    (value: string) => {
      markDirty();
      setNoteValue(value);
    },
    [markDirty],
  );

  return {
    routineId,
    name: nameValue,
    note: noteValue,
    blocks,
    groups,
    selectedBlockIds,
    createdAt,
    isDirty,
    setName,
    setNote,
    addBlock,
    updateBlock,
    moveBlock,
    toggleBlockSelection,
    clearSelection,
    removeSelectedBlocks,
    createSeriesFromSelection,
    updateSeries,
    clearSeries,
    selectedGroup,
    totalDurationSec,
    buildRoutinePayload,
  };
};
