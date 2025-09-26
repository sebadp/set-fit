declare module 'expo-sqlite/next' {
  export type SQLiteBindValue = string | number | null;

  export type SQLiteRunResult = {
    rowsAffected: number;
    lastInsertRowId: number | null;
  };

  export interface SQLiteDatabase {
    execAsync: (sql: string) => Promise<void>;
    getFirstAsync: <T = unknown>(sql: string, ...params: SQLiteBindValue[]) => Promise<T | null>;
    getAllAsync: <T = unknown>(sql: string, ...params: SQLiteBindValue[]) => Promise<T[]>;
    runAsync: (sql: string, ...params: SQLiteBindValue[]) => Promise<SQLiteRunResult>;
    withTransactionAsync: <T>(callback: (db: SQLiteDatabase) => Promise<T>) => Promise<T>;
  }

  export const openDatabaseAsync: (name: string) => Promise<SQLiteDatabase>;
}
