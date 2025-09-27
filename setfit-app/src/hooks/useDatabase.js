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

export const useRoutines = (userId = 1) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { database, isReady } = useDatabase();

  const loadRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      const routinesData = await database.getAllRoutines(userId);
      setRoutines(routinesData);
    } catch (err) {
      console.error('Error loading routines:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createRoutine = async (routineData) => {
    try {
      const routineId = await database.createRoutine(routineData);
      await loadRoutines(); // Refresh the list
      return routineId;
    } catch (err) {
      console.error('Error creating routine:', err);
      throw err;
    }
  };

  const updateRoutine = async (routineId, updates) => {
    try {
      await database.updateRoutine(routineId, updates);
      await loadRoutines(); // Refresh the list
    } catch (err) {
      console.error('Error updating routine:', err);
      throw err;
    }
  };

  const deleteRoutine = async (routineId) => {
    try {
      await database.deleteRoutine(routineId);
      await loadRoutines(); // Refresh the list
    } catch (err) {
      console.error('Error deleting routine:', err);
      throw err;
    }
  };

  const duplicateRoutine = async (routine) => {
    try {
      const duplicatedRoutine = {
        ...routine,
        id: undefined,
        name: `${routine.name} (Copia)`,
        is_template: 0,
        usage_count: 0,
        last_used: null,
      };

      const routineId = await database.createRoutine(duplicatedRoutine);
      await loadRoutines(); // Refresh the list
      return routineId;
    } catch (err) {
      console.error('Error duplicating routine:', err);
      throw err;
    }
  };

  const updateRoutineUsage = async (routineId) => {
    try {
      await database.updateRoutineUsage(routineId);
      await loadRoutines(); // Refresh the list
    } catch (err) {
      console.error('Error updating routine usage:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isReady) {
      loadRoutines();
    }
  }, [isReady, userId]);

  return {
    routines,
    loading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    updateRoutineUsage,
    reloadRoutines: loadRoutines,
  };
};

export const useExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { database, isReady } = useDatabase();

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      const exercisesData = await database.getAllExercises();
      setExercises(exercisesData);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getExercisesByCategory = async (category) => {
    try {
      return await database.getExercisesByCategory(category);
    } catch (err) {
      console.error('Error loading exercises by category:', err);
      throw err;
    }
  };

  const createExercise = async (exerciseData) => {
    try {
      const exerciseId = await database.createExercise(exerciseData);
      await loadExercises(); // Refresh the list
      return exerciseId;
    } catch (err) {
      console.error('Error creating exercise:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isReady) {
      loadExercises();
    }
  }, [isReady]);

  return {
    exercises,
    loading,
    error,
    getExercisesByCategory,
    createExercise,
    reloadExercises: loadExercises,
  };
};