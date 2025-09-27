// Routine data models and types for SetFit

// Exercise types and categories
export const EXERCISE_CATEGORIES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
  FLEXIBILITY: 'flexibility',
  BALANCE: 'balance',
  CORE: 'core',
  HIIT: 'hiit',
  WARM_UP: 'warm_up',
  COOL_DOWN: 'cool_down',
};

export const ROUTINE_CATEGORIES = {
  CUSTOM: 'custom',
  TEMPLATE: 'template',
  HIIT: 'hiit',
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  YOGA: 'yoga',
  QUICK: 'quick',
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export const BLOCK_TYPES = {
  EXERCISE: 'exercise',
  REST: 'rest',
  PREPARATION: 'preparation',
};

// Default exercises for the library
export const DEFAULT_EXERCISES = [
  // Warm-up
  {
    name: 'Calentamiento General',
    category: EXERCISE_CATEGORIES.WARM_UP,
    description: 'Movimientos suaves para preparar el cuerpo',
    default_duration: 60,
    muscle_groups: JSON.stringify(['full_body']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
  {
    name: 'Movilidad Articular',
    category: EXERCISE_CATEGORIES.WARM_UP,
    description: 'Rotaciones y estiramientos articulares',
    default_duration: 30,
    muscle_groups: JSON.stringify(['joints']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },

  // HIIT exercises
  {
    name: 'Burpees',
    category: EXERCISE_CATEGORIES.HIIT,
    description: 'Ejercicio completo: sentadilla, plancha, salto',
    default_duration: 30,
    muscle_groups: JSON.stringify(['full_body', 'cardio']),
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    is_default: 1,
  },
  {
    name: 'Mountain Climbers',
    category: EXERCISE_CATEGORIES.HIIT,
    description: 'Escaladores en posición de plancha',
    default_duration: 30,
    muscle_groups: JSON.stringify(['core', 'cardio', 'arms']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
  {
    name: 'Jumping Jacks',
    category: EXERCISE_CATEGORIES.CARDIO,
    description: 'Saltos abriendo y cerrando piernas y brazos',
    default_duration: 30,
    muscle_groups: JSON.stringify(['cardio', 'legs']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },

  // Strength
  {
    name: 'Push-ups',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Flexiones de pecho',
    default_duration: 45,
    muscle_groups: JSON.stringify(['chest', 'arms', 'core']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
  {
    name: 'Squats',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Sentadillas',
    default_duration: 45,
    muscle_groups: JSON.stringify(['legs', 'glutes']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
  {
    name: 'Plancha',
    category: EXERCISE_CATEGORIES.CORE,
    description: 'Plancha estática',
    default_duration: 60,
    muscle_groups: JSON.stringify(['core', 'arms']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },

  // Rest periods
  {
    name: 'Descanso Activo',
    category: EXERCISE_CATEGORIES.COOL_DOWN,
    description: 'Caminar en el lugar o estiramientos suaves',
    default_duration: 30,
    muscle_groups: JSON.stringify(['recovery']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
  {
    name: 'Descanso Completo',
    category: EXERCISE_CATEGORIES.COOL_DOWN,
    description: 'Reposo total',
    default_duration: 60,
    muscle_groups: JSON.stringify(['recovery']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
  },
];

// Predefined routine templates
export const ROUTINE_TEMPLATES = [
  {
    name: 'HIIT Básico 10 min',
    description: 'Rutina de alta intensidad para principiantes',
    category: ROUTINE_CATEGORIES.HIIT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_template: 1,
    total_duration: 600, // 10 minutes
    blocks_json: JSON.stringify([
      { type: BLOCK_TYPES.PREPARATION, exercise_name: 'Calentamiento General', duration: 60 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Jumping Jacks', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Push-ups', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Squats', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Mountain Climbers', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Plancha', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 60 },
      // Repetir ciclo
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Burpees', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Push-ups', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Squats', duration: 30 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 60 },
    ]),
  },
  {
    name: 'Fuerza Express 15 min',
    description: 'Entrenamiento de fuerza enfocado en grupos musculares principales',
    category: ROUTINE_CATEGORIES.STRENGTH,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    is_template: 1,
    total_duration: 900, // 15 minutes
    blocks_json: JSON.stringify([
      { type: BLOCK_TYPES.PREPARATION, exercise_name: 'Movilidad Articular', duration: 60 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Push-ups', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Squats', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Plancha', duration: 60 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 60 },
      // Serie 2
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Push-ups', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Squats', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Plancha', duration: 60 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 60 },
      // Serie 3
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Push-ups', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Squats', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 90 },
    ]),
  },
  {
    name: 'Cardio Rápido 5 min',
    description: 'Sesión cardiovascular intensa y breve',
    category: ROUTINE_CATEGORIES.QUICK,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_template: 1,
    total_duration: 300, // 5 minutes
    blocks_json: JSON.stringify([
      { type: BLOCK_TYPES.PREPARATION, exercise_name: 'Calentamiento General', duration: 30 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Jumping Jacks', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Mountain Climbers', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Burpees', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Activo', duration: 15 },
      { type: BLOCK_TYPES.EXERCISE, exercise_name: 'Jumping Jacks', duration: 45 },
      { type: BLOCK_TYPES.REST, exercise_name: 'Descanso Completo', duration: 60 },
    ]),
  },
];

// Utility functions for routine management
export const createEmptyRoutine = (userId = 1) => ({
  user_id: userId,
  name: 'Nueva Rutina',
  description: '',
  category: ROUTINE_CATEGORIES.CUSTOM,
  difficulty: DIFFICULTY_LEVELS.BEGINNER,
  is_template: 0,
  total_duration: 0,
  blocks_json: JSON.stringify([]),
  usage_count: 0,
});

export const calculateRoutineDuration = (blocks) => {
  if (!Array.isArray(blocks)) return 0;
  return blocks.reduce((total, block) => total + (block.duration || 0), 0);
};

export const validateRoutine = (routine) => {
  const errors = [];

  if (!routine.name?.trim()) {
    errors.push('El nombre es requerido');
  }

  if (!routine.blocks_json || routine.blocks_json === '[]') {
    errors.push('La rutina debe tener al menos un bloque');
  }

  try {
    const blocks = JSON.parse(routine.blocks_json);
    if (!Array.isArray(blocks) || blocks.length === 0) {
      errors.push('La rutina debe tener bloques válidos');
    }
  } catch (e) {
    errors.push('Formato de bloques inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

export const getDifficultyColor = (difficulty, theme) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.BEGINNER:
      return theme.colors.success;
    case DIFFICULTY_LEVELS.INTERMEDIATE:
      return theme.colors.warning;
    case DIFFICULTY_LEVELS.ADVANCED:
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

export const getCategoryIcon = (category) => {
  switch (category) {
    case ROUTINE_CATEGORIES.HIIT:
      return '🔥';
    case ROUTINE_CATEGORIES.STRENGTH:
      return '💪';
    case ROUTINE_CATEGORIES.CARDIO:
      return '❤️';
    case ROUTINE_CATEGORIES.YOGA:
      return '🧘';
    case ROUTINE_CATEGORIES.QUICK:
      return '⚡';
    case ROUTINE_CATEGORIES.TEMPLATE:
      return '📋';
    default:
      return '🏃';
  }
};