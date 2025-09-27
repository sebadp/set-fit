// Database schema and constants for SetFit
export const DATABASE_NAME = 'setfit.db';
export const DATABASE_VERSION = 1;

// Table schemas following the Sprint 2 plan
export const TABLES = {
  // Users table - basic user profile
  USERS: {
    name: 'users',
    schema: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL DEFAULT 'Usuario',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        preferences_json TEXT DEFAULT '{}'
      );
    `,
  },

  // User stats - training statistics
  USER_STATS: {
    name: 'user_stats',
    schema: `
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_workouts INTEGER DEFAULT 0,
        total_time INTEGER DEFAULT 0,
        last_workout_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `,
  },

  // Workout sessions - individual training records
  WORKOUT_SESSIONS: {
    name: 'workout_sessions',
    schema: `
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `,
  },

  // Settings - app configuration
  SETTINGS: {
    name: 'settings',
    schema: `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, key)
      );
    `,
  },
};

// Default user preferences
export const DEFAULT_PREFERENCES = {
  sounds_enabled: true,
  vibration_enabled: true,
  default_timer_duration: 300, // 5 minutes
  auto_start_next: false,
  theme: 'dark',
  language: 'es',
};

// Settings keys
export const SETTING_KEYS = {
  SOUNDS_ENABLED: 'sounds_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
  DEFAULT_TIMER_DURATION: 'default_timer_duration',
  AUTO_START_NEXT: 'auto_start_next',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Indexes for better performance
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_workout_sessions_created_at ON workout_sessions(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, key);',
];