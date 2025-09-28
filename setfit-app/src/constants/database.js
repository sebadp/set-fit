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
        routine_id INTEGER,
        duration INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        session_state TEXT DEFAULT 'completed',
        current_block_index INTEGER DEFAULT 0,
        current_set INTEGER DEFAULT 1,
        blocks_data TEXT DEFAULT '[]',
        pause_timestamps TEXT DEFAULT '[]',
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (routine_id) REFERENCES routines (id)
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

  // Routines - custom workout routines
  ROUTINES: {
    name: 'routines',
    schema: `
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'custom',
        difficulty TEXT DEFAULT 'beginner',
        is_template INTEGER DEFAULT 0,
        total_duration INTEGER DEFAULT 0,
        blocks_json TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME,
        usage_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `,
  },

  // Exercises - exercise library
  EXERCISES: {
    name: 'exercises',
    schema: `
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT,
        default_duration INTEGER DEFAULT 30,
        muscle_groups TEXT DEFAULT '[]',
        difficulty TEXT DEFAULT 'beginner',
        is_default INTEGER DEFAULT 0,
        exercise_type TEXT DEFAULT 'time_based',
        default_reps INTEGER,
        default_sets INTEGER DEFAULT 1,
        rest_between_sets INTEGER DEFAULT 0,
        equipment TEXT DEFAULT '[]',
        instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  USER_NAME: 'user_name',
};

// Indexes for better performance
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_workout_sessions_created_at ON workout_sessions(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, key);',
  'CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_routines_category ON routines(category);',
  'CREATE INDEX IF NOT EXISTS idx_routines_last_used ON routines(last_used);',
  'CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);',
  'CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);',
];