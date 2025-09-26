import { getDatabase } from './db';

export type SessionStatus = 'completed' | 'aborted' | 'running';

export type SessionLog = {
  id: string;
  routineId: string;
  routineName: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  totalElapsedSec: number;
};

export const startSession = async (options: { id: string; routineId: string; startedAt: string }) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sessions (id, routineId, status, startedAt, completedAt, totalElapsedSec)
     VALUES (?, ?, 'running', ?, NULL, 0);`,
    options.id,
    options.routineId,
    options.startedAt,
  );
};

export const finalizeSession = async (options: {
  id: string;
  status: Exclude<SessionStatus, 'running'>;
  completedAt: string;
  totalElapsedSec: number;
}) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sessions
     SET status = ?, completedAt = ?, totalElapsedSec = ?
     WHERE id = ?;`,
    options.status,
    options.completedAt,
    Math.round(options.totalElapsedSec),
    options.id,
  );
};

export const fetchRecentSessions = async (limit = 10): Promise<SessionLog[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    routineId: string;
    routineName: string;
    status: SessionStatus;
    startedAt: string;
    completedAt: string | null;
    totalElapsedSec: number;
  }>(
    `SELECT s.id, s.routineId, r.name as routineName, s.status, s.startedAt, s.completedAt, s.totalElapsedSec
     FROM sessions s
     LEFT JOIN routines r ON r.id = s.routineId
     ORDER BY datetime(s.startedAt) DESC
     LIMIT ?;`,
    limit,
  );
  return rows;
};
