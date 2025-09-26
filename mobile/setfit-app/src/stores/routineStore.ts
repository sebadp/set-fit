import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { Routine } from '@/types/routine';
import {
  deleteRoutine,
  fetchLastRunRoutineId,
  fetchRoutines,
  saveRoutine,
  setLastRunRoutineId,
} from '@/services/persistence/routineRepository';

export type RoutineStoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export type RoutineStoreState = {
  status: RoutineStoreStatus;
  routines: Routine[];
  selectedRoutineId?: string;
  lastRunRoutineId?: string;
  errorMessage?: string;
};

export type RoutineStoreActions = {
  hydrate: () => Promise<void>;
  selectRoutine: (routineId?: string) => void;
  addRoutine: (routine: Routine) => Promise<void>;
  updateRoutine: (routine: Routine) => Promise<void>;
  removeRoutine: (routineId: string) => Promise<void>;
  markRoutineAsRan: (routineId: string) => Promise<void>;
};

export type RoutineStore = RoutineStoreState & RoutineStoreActions;

const initialState: RoutineStoreState = {
  status: 'idle',
  routines: [],
  selectedRoutineId: undefined,
  lastRunRoutineId: undefined,
  errorMessage: undefined,
};

export const useRoutineStore = create<RoutineStore>()(
  immer((set, get) => ({
    ...initialState,
    hydrate: async () => {
      if (get().status === 'loading') {
        return;
      }
      set((state) => {
        state.status = 'loading';
        state.errorMessage = undefined;
      });

      try {
        const [routines, lastRunId] = await Promise.all([
          fetchRoutines(),
          fetchLastRunRoutineId(),
        ]);

        set((state) => {
          state.routines = routines;
          state.status = 'ready';
          const firstRoutineId = routines[0]?.id;
          state.selectedRoutineId = state.selectedRoutineId ?? lastRunId ?? firstRoutineId;
          state.lastRunRoutineId = lastRunId ?? firstRoutineId;
        });
      } catch (error) {
        set((state) => {
          state.status = 'error';
          state.errorMessage = error instanceof Error ? error.message : String(error);
        });
      }
    },
    selectRoutine: (routineId) => {
      set((state) => {
        state.selectedRoutineId = routineId;
      });
    },
    addRoutine: async (routine) => {
      await saveRoutine(routine);
      set((state) => {
        state.routines.unshift(routine);
        state.selectedRoutineId = routine.id;
        state.lastRunRoutineId = state.lastRunRoutineId ?? routine.id;
      });
    },
    updateRoutine: async (routine) => {
      await saveRoutine(routine);
      set((state) => {
        const index = state.routines.findIndex((item) => item.id === routine.id);
        if (index >= 0) {
          state.routines[index] = routine;
        } else {
          state.routines.unshift(routine);
        }
        state.selectedRoutineId = routine.id;
      });
    },
    removeRoutine: async (routineId) => {
      await deleteRoutine(routineId);
      set((state) => {
        state.routines = state.routines.filter((item) => item.id !== routineId);
        if (state.selectedRoutineId === routineId) {
          state.selectedRoutineId = state.routines[0]?.id;
        }
        if (state.lastRunRoutineId === routineId) {
          state.lastRunRoutineId = state.routines[0]?.id;
        }
      });
    },
    markRoutineAsRan: async (routineId) => {
      const exists = get().routines.some((item) => item.id === routineId);
      if (!exists) {
        return;
      }
      await setLastRunRoutineId(routineId);
      set((state) => {
        state.lastRunRoutineId = routineId;
      });
    },
  })),
);

export const selectRoutineSummaries = (state: RoutineStore) =>
  state.routines.map((routine) => ({
    id: routine.id,
    name: routine.name,
    totalDurationSec: routine.totalDurationSec,
    updatedAt: routine.updatedAt,
  }));

export const selectLastUsedRoutine = (state: RoutineStore) =>
  state.routines.find((routine) => routine.id === state.lastRunRoutineId) ?? null;

export const selectSelectedRoutine = (state: RoutineStore) =>
  state.routines.find((routine) => routine.id === state.selectedRoutineId) ?? null;
