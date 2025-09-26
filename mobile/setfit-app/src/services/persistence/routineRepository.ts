import { Routine, RoutineBlock, RoutineGroup } from '@/types/routine';

import { getDatabase } from './db';
import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite/next';

type RoutineRow = {
  id: string;
  name: string;
  note: string | null;
  totalDurationSec: number;
  createdAt: string;
  updatedAt: string;
};

type BlockRow = {
  id: string;
  routineId: string;
  name: string;
  type: 'exercise' | 'rest';
  durationSec: number;
  position: number;
  groupId: string | null;
};

type GroupRow = {
  id: string;
  routineId: string;
  label: string;
  repetitions: number;
};

const mapRoutineRow = (row: RoutineRow): Routine => ({
  id: row.id,
  name: row.name,
  note: row.note ?? undefined,
  totalDurationSec: row.totalDurationSec,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  blocks: [],
  groups: [],
});

const mapBlockRow = (row: BlockRow): RoutineBlock => ({
  id: row.id,
  routineId: row.routineId,
  name: row.name,
  type: row.type,
  durationSec: row.durationSec,
  order: row.position,
  groupId: row.groupId ?? undefined,
});

const mapGroupRow = (row: GroupRow): RoutineGroup => ({
  id: row.id,
  routineId: row.routineId,
  label: row.label,
  repetitions: row.repetitions,
});

export const fetchRoutines = async (): Promise<Routine[]> => {
  const db = await getDatabase();
  const routineRows = await db.getAllAsync<RoutineRow>(
    'SELECT id, name, note, totalDurationSec, createdAt, updatedAt FROM routines ORDER BY datetime(updatedAt) DESC;',
  );

  if (routineRows.length === 0) {
    return [];
  }

  const routineMap = new Map<string, Routine>(routineRows.map((row: RoutineRow) => [row.id, mapRoutineRow(row)]));
  const routineIds = Array.from(routineMap.keys());

  const placeholders = routineIds.map(() => '?').join(', ');
  const params: SQLiteBindValue[] = routineIds;

  const blockRows = await db.getAllAsync<BlockRow>(
    `SELECT id, routineId, name, type, durationSec, position, groupId FROM routine_blocks WHERE routineId IN (${placeholders}) ORDER BY position ASC;`,
    ...params,
  );

  for (const block of blockRows.map((row) => mapBlockRow(row))) {
    const routine = routineMap.get(block.routineId);
    if (routine) {
      routine.blocks.push(block);
    }
  }

  const groupRows = await db.getAllAsync<GroupRow>(
    `SELECT id, routineId, label, repetitions FROM routine_groups WHERE routineId IN (${placeholders});`,
    ...params,
  );

  for (const group of groupRows.map((row) => mapGroupRow(row))) {
    const routine = routineMap.get(group.routineId);
    if (routine) {
      routine.groups.push(group);
    }
  }

  for (const routine of routineMap.values()) {
    routine.blocks.sort((a, b) => a.order - b.order);
  }

  return Array.from(routineMap.values());
};

export const fetchLastRunRoutineId = async (): Promise<string | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM app_meta WHERE key = ?', 'last_run_routine_id');
  return row?.value ?? null;
};

export const setLastRunRoutineId = async (routineId: string | null) => {
  const db = await getDatabase();
  if (!routineId) {
    await db.runAsync('DELETE FROM app_meta WHERE key = ?', 'last_run_routine_id');
    return;
  }
  await db.runAsync('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', 'last_run_routine_id', routineId);
};

export const saveRoutine = async (routine: Routine) => {
  const db = await getDatabase();
  await db.withTransactionAsync(async (txn: SQLiteDatabase) => {
    await txn.runAsync(
      `INSERT INTO routines (id, name, note, totalDurationSec, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         note = excluded.note,
         totalDurationSec = excluded.totalDurationSec,
         createdAt = excluded.createdAt,
         updatedAt = excluded.updatedAt;`,
      routine.id,
      routine.name,
      routine.note ?? null,
      routine.totalDurationSec,
      routine.createdAt,
      routine.updatedAt,
    );

    await txn.runAsync('DELETE FROM routine_blocks WHERE routineId = ?', routine.id);
    await txn.runAsync('DELETE FROM routine_groups WHERE routineId = ?', routine.id);

    for (const block of routine.blocks) {
      await txn.runAsync(
        `INSERT INTO routine_blocks (id, routineId, name, type, durationSec, position, groupId)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        block.id,
        routine.id,
        block.name,
        block.type,
        block.durationSec,
        block.order,
        block.groupId ?? null,
      );
    }

    for (const group of routine.groups) {
      await txn.runAsync(
        `INSERT INTO routine_groups (id, routineId, label, repetitions)
         VALUES (?, ?, ?, ?);`,
        group.id,
        routine.id,
        group.label,
        group.repetitions,
      );
    }
  });
};

export const deleteRoutine = async (routineId: string) => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM routines WHERE id = ?', routineId);
};
