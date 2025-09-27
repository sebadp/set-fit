import * as SQLite from 'expo-sqlite';
import {
  DATABASE_NAME,
  TABLES,
  INDEXES,
  DEFAULT_PREFERENCES,
  SETTING_KEYS
} from '../constants/database';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      if (this.isInitialized) return;

      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      await this.createIndexes();
      await this.ensureDefaultUser();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      // Create tables in order (users first, then dependent tables)
      await this.db.execAsync(TABLES.USERS.schema);
      await this.db.execAsync(TABLES.USER_STATS.schema);
      await this.db.execAsync(TABLES.WORKOUT_SESSIONS.schema);
      await this.db.execAsync(TABLES.SETTINGS.schema);

      console.log('✅ All tables created successfully');
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      for (const indexQuery of INDEXES) {
        await this.db.execAsync(indexQuery);
      }
      console.log('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
      throw error;
    }
  }

  async ensureDefaultUser() {
    try {
      const users = await this.db.getAllAsync('SELECT * FROM users LIMIT 1');

      if (users.length === 0) {
        // Create default user
        const result = await this.db.runAsync(
          'INSERT INTO users (name, preferences_json) VALUES (?, ?)',
          ['Usuario', JSON.stringify(DEFAULT_PREFERENCES)]
        );

        const userId = result.lastInsertRowId;

        // Create user stats
        await this.db.runAsync(
          'INSERT INTO user_stats (user_id) VALUES (?)',
          [userId]
        );

        // Create default settings
        for (const [key, value] of Object.entries(DEFAULT_PREFERENCES)) {
          await this.db.runAsync(
            'INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?)',
            [userId, key, JSON.stringify(value)]
          );
        }

        console.log('✅ Default user created with ID:', userId);
        return userId;
      }

      return users[0].id;
    } catch (error) {
      console.error('❌ Failed to ensure default user:', error);
      throw error;
    }
  }

  // User operations
  async getUser(userId = 1) {
    try {
      const user = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (user && user.preferences_json) {
        user.preferences = JSON.parse(user.preferences_json);
      }

      return user;
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      throw error;
    }
  }

  async updateUser(userId, data) {
    try {
      const { name, preferences } = data;
      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }

      if (preferences !== undefined) {
        updates.push('preferences_json = ?');
        values.push(JSON.stringify(preferences));
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        await this.db.runAsync(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      return await this.getUser(userId);
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  // Settings operations
  async getSetting(userId, key) {
    try {
      const setting = await this.db.getFirstAsync(
        'SELECT value FROM settings WHERE user_id = ? AND key = ?',
        [userId, key]
      );

      return setting ? JSON.parse(setting.value) : null;
    } catch (error) {
      console.error('❌ Failed to get setting:', error);
      throw error;
    }
  }

  async setSetting(userId, key, value) {
    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO settings (user_id, key, value, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, key, JSON.stringify(value)]
      );
    } catch (error) {
      console.error('❌ Failed to set setting:', error);
      throw error;
    }
  }

  async getAllSettings(userId) {
    try {
      const settings = await this.db.getAllAsync(
        'SELECT key, value FROM settings WHERE user_id = ?',
        [userId]
      );

      const result = {};
      for (const setting of settings) {
        result[setting.key] = JSON.parse(setting.value);
      }

      return result;
    } catch (error) {
      console.error('❌ Failed to get all settings:', error);
      throw error;
    }
  }

  // Workout session operations
  async saveWorkoutSession(userId, duration, completed = true, notes = '') {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO workout_sessions (user_id, duration, completed, notes) VALUES (?, ?, ?, ?)',
        [userId, duration, completed ? 1 : 0, notes]
      );

      // Update user stats
      await this.updateUserStats(userId, duration);

      return result.lastInsertRowId;
    } catch (error) {
      console.error('❌ Failed to save workout session:', error);
      throw error;
    }
  }

  async updateUserStats(userId, additionalTime) {
    try {
      await this.db.runAsync(
        `UPDATE user_stats SET
         total_workouts = total_workouts + 1,
         total_time = total_time + ?,
         last_workout_date = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [additionalTime, userId]
      );
    } catch (error) {
      console.error('❌ Failed to update user stats:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const stats = await this.db.getFirstAsync(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId]
      );
      return stats;
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      throw error;
    }
  }

  // Backup operations
  async exportData(userId) {
    try {
      const user = await this.getUser(userId);
      const stats = await this.getUserStats(userId);
      const settings = await this.getAllSettings(userId);
      const sessions = await this.db.getAllAsync(
        'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return {
        user,
        stats,
        settings,
        sessions,
        exportDate: new Date().toISOString(),
        version: 1,
      };
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw error;
    }
  }

  // Development helper
  async dropAllTables() {
    try {
      await this.db.execAsync('DROP TABLE IF EXISTS workout_sessions');
      await this.db.execAsync('DROP TABLE IF EXISTS settings');
      await this.db.execAsync('DROP TABLE IF EXISTS user_stats');
      await this.db.execAsync('DROP TABLE IF EXISTS users');
      console.log('🗑️ All tables dropped');
    } catch (error) {
      console.error('❌ Failed to drop tables:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const database = new DatabaseService();