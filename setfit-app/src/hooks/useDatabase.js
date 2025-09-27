import { useState, useEffect } from 'react';
import { database } from '../utils/database';

export const useDatabase = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await database.init();

      setIsReady(true);
      console.log('✅ Database hook ready');
    } catch (err) {
      console.error('❌ Database initialization error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const retryInit = () => {
    initializeDatabase();
  };

  return {
    isLoading,
    isReady,
    error,
    retryInit,
    database,
  };
};

export const useUserProfile = (userId = 1) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await database.getUser(userId);
      setUser(userData);
    } catch (err) {
      console.error('❌ Failed to load user:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data) => {
    try {
      const updatedUser = await database.updateUser(userId, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('❌ Failed to update user:', err);
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    if (database.isInitialized) {
      loadUser();
    }
  }, [userId, database.isInitialized]);

  return {
    user,
    loading,
    error,
    updateUser,
    reloadUser: loadUser,
  };
};

export const useSettings = (userId = 1) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userSettings = await database.getAllSettings(userId);
      setSettings(userSettings);
    } catch (err) {
      console.error('❌ Failed to load settings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await database.setSetting(userId, key, value);
      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
    } catch (err) {
      console.error('❌ Failed to update setting:', err);
      setError(err);
      throw err;
    }
  };

  const getSetting = (key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  useEffect(() => {
    if (database.isInitialized) {
      loadSettings();
    }
  }, [userId, database.isInitialized]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    reloadSettings: loadSettings,
  };
};

export const useWorkoutStats = (userId = 1) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStats = await database.getUserStats(userId);
      setStats(userStats);
    } catch (err) {
      console.error('❌ Failed to load stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (duration, completed = true, notes = '') => {
    try {
      await database.saveWorkoutSession(userId, duration, completed, notes);
      // Reload stats after saving
      await loadStats();
    } catch (err) {
      console.error('❌ Failed to save workout:', err);
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    if (database.isInitialized) {
      loadStats();
    }
  }, [userId, database.isInitialized]);

  return {
    stats,
    loading,
    error,
    saveWorkout,
    reloadStats: loadStats,
  };
};