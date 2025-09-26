import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

import { mockRoutines } from '@/data/mockRoutines';

const DB_NAME = 'setfit.db';
let databasePromise: Promise<SQLiteDatabase> | null = null;

const SCHEMA_VERSION = 2;

export const getDatabase = async (): Promise<SQLiteDatabase> => {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DB_NAME);
  }
  return databasePromise;
};

const ensureSchema = async (db: SQLiteDatabase) => {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);

  const versionRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', 'schema_version');
  const currentVersion = versionRow ? Number(versionRow.value) : 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        note TEXT,
        totalDurationSec INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routine_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        routineId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        durationSec INTEGER NOT NULL,
        position INTEGER NOT NULL,
        groupId TEXT,
        FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS routine_groups (
        id TEXT PRIMARY KEY NOT NULL,
        routineId TEXT NOT NULL,
        label TEXT NOT NULL,
        repetitions INTEGER NOT NULL,
        FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
      );
    `);
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        routineId TEXT NOT NULL,
        status TEXT NOT NULL,
        startedAt TEXT NOT NULL,
        completedAt TEXT,
        totalElapsedSec INTEGER NOT NULL,
        FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
      );
    `);
  }

  if (currentVersion !== SCHEMA_VERSION) {
    await db.runAsync('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', 'schema_version', String(SCHEMA_VERSION));
  }
};

const seedRoutines = async (db: SQLiteDatabase) => {
  if (mockRoutines.length === 0) {
    return;
  }

  await db.withTransactionAsync(async (txn: SQLiteDatabase) => {
    for (const routine of mockRoutines) {
      await txn.runAsync(
        `INSERT OR REPLACE INTO routines (id, name, note, totalDurationSec, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);`,
        routine.id,
        routine.name,
        routine.note ?? null,
        routine.totalDurationSec,
        routine.createdAt,
        routine.updatedAt,
      );

      await txn.runAsync(`DELETE FROM routine_blocks WHERE routineId = ?;`, routine.id);
      await txn.runAsync(`DELETE FROM routine_groups WHERE routineId = ?;`, routine.id);

      for (const block of routine.blocks) {
        await txn.runAsync(
          `INSERT INTO routine_blocks (id, routineId, name, type, durationSec, position, groupId) VALUES (?, ?, ?, ?, ?, ?, ?);`,
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
          `INSERT INTO routine_groups (id, routineId, label, repetitions) VALUES (?, ?, ?, ?);`,
          group.id,
          routine.id,
          group.label,
          group.repetitions,
        );
      }
    }

    const defaultRoutineId = mockRoutines[0]?.id;
    if (defaultRoutineId) {
      await txn.runAsync('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?);', 'last_run_routine_id', defaultRoutineId);
    }
  });
};

export const initializeDatabase = async () => {
  const db = await getDatabase();
  await ensureSchema(db);

  const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM routines;');
  const total = countRow?.count ?? 0;

  if (total === 0) {
    await seedRoutines(db);
  }
};
