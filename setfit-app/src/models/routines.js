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
  SET_GROUP: 'set_group', // Grupo de series con múltiples ejercicios
};

export const EXERCISE_TYPES = {
  TIME_BASED: 'time_based', // Basado en tiempo (ej: plancha 30s)
  REP_BASED: 'rep_based',   // Basado en repeticiones (ej: 15 push-ups)
  DISTANCE_BASED: 'distance_based', // Basado en distancia (ej: 100m corriendo)
};

export const SET_STRUCTURES = {
  STRAIGHT_SET: 'straight_set',     // Serie normal: 3 sets x 15 reps
  SUPERSET: 'superset',             // Superserie: 2 ejercicios sin descanso
  CIRCUIT: 'circuit',               // Circuito: múltiples ejercicios en rotación
  PYRAMID: 'pyramid',               // Pirámide: repeticiones crecientes/decrecientes
  DROP_SET: 'drop_set',             // Drop set: reducir peso/intensidad
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
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 1,
    rest_between_sets: 0,
  },
  {
    name: 'Movilidad Articular',
    category: EXERCISE_CATEGORIES.WARM_UP,
    description: 'Rotaciones y estiramientos articulares',
    default_duration: 30,
    muscle_groups: JSON.stringify(['joints']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 1,
    rest_between_sets: 0,
    equipment: JSON.stringify([]),
    instructions: 'Realiza movimientos circulares suaves en articulaciones principales: cuello, hombros, muñecas, caderas, rodillas y tobillos.',
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
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 10,
    default_sets: 3,
    rest_between_sets: 60,
    equipment: JSON.stringify([]),
    instructions: '1. Parado, baja a sentadilla y coloca manos en el suelo. 2. Salta hacia atrás a plancha. 3. Haz una flexión (opcional). 4. Salta hacia adelante a sentadilla. 5. Salta hacia arriba con brazos extendidos.',
  },
  {
    name: 'Mountain Climbers',
    category: EXERCISE_CATEGORIES.HIIT,
    description: 'Escaladores en posición de plancha',
    default_duration: 30,
    muscle_groups: JSON.stringify(['core', 'cardio', 'arms']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 3,
    rest_between_sets: 45,
    equipment: JSON.stringify([]),
    instructions: 'En posición de plancha, alterna rápidamente llevando rodillas al pecho como si estuvieras corriendo en el lugar.',
  },
  {
    name: 'Jumping Jacks',
    category: EXERCISE_CATEGORIES.CARDIO,
    description: 'Saltos abriendo y cerrando piernas y brazos',
    default_duration: 30,
    muscle_groups: JSON.stringify(['cardio', 'legs']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 20,
    default_sets: 3,
    rest_between_sets: 30,
    equipment: JSON.stringify([]),
    instructions: 'Parado con pies juntos y brazos a los lados. Salta abriendo piernas y subiendo brazos sobre la cabeza. Regresa a posición inicial.',
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
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 12,
    default_sets: 3,
    rest_between_sets: 60,
    equipment: JSON.stringify([]),
    instructions: 'En posición de plancha, baja el pecho hacia el suelo flexionando brazos. Empuja hacia arriba hasta extender completamente los brazos.',
  },
  {
    name: 'Squats',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Sentadillas',
    default_duration: 45,
    muscle_groups: JSON.stringify(['legs', 'glutes']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 15,
    default_sets: 3,
    rest_between_sets: 60,
    equipment: JSON.stringify([]),
    instructions: 'Parado con pies al ancho de hombros, baja como si te fueras a sentar. Mantén espalda recta y rodillas alineadas con los pies.',
  },
  {
    name: 'Plancha',
    category: EXERCISE_CATEGORIES.CORE,
    description: 'Plancha estática',
    default_duration: 60,
    muscle_groups: JSON.stringify(['core', 'arms']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 3,
    rest_between_sets: 90,
    equipment: JSON.stringify([]),
    instructions: 'Apoya antebrazos y punta de pies en el suelo. Mantén cuerpo recto desde cabeza hasta talones. Contrae abdomen.',
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
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 1,
    rest_between_sets: 0,
    equipment: JSON.stringify([]),
    instructions: 'Camina en el lugar suavemente o realiza estiramientos ligeros para mantener el cuerpo en movimiento durante el descanso.',
  },
  {
    name: 'Descanso Completo',
    category: EXERCISE_CATEGORIES.COOL_DOWN,
    description: 'Reposo total',
    default_duration: 60,
    muscle_groups: JSON.stringify(['recovery']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 1,
    rest_between_sets: 0,
    equipment: JSON.stringify([]),
    instructions: 'Descansa completamente. Siéntate o recostáte y permite que tu ritmo cardíaco vuelva a la normalidad.',
  },

  // Additional strength exercises
  {
    name: 'Lunges',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Zancadas alternas para piernas y glúteos',
    default_duration: 45,
    muscle_groups: JSON.stringify(['legs', 'glutes', 'core']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 12,
    default_sets: 3,
    rest_between_sets: 60,
    equipment: JSON.stringify([]),
    instructions: 'Da un paso largo hacia adelante, baja la rodilla trasera hacia el suelo. Alterna piernas.',
  },

  {
    name: 'Pike Push-ups',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Flexiones en V para hombros',
    default_duration: 45,
    muscle_groups: JSON.stringify(['shoulders', 'arms', 'core']),
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 8,
    default_sets: 3,
    rest_between_sets: 90,
    equipment: JSON.stringify([]),
    instructions: 'Forma una V invertida con tu cuerpo. Baja la cabeza hacia el suelo flexionando brazos.',
  },

  {
    name: 'Wall Sit',
    category: EXERCISE_CATEGORIES.STRENGTH,
    description: 'Sentadilla isométrica contra la pared',
    default_duration: 45,
    muscle_groups: JSON.stringify(['legs', 'glutes']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 3,
    rest_between_sets: 90,
    equipment: JSON.stringify(['wall']),
    instructions: 'Apoya espalda contra la pared y baja hasta formar 90° con las rodillas. Mantén la posición.',
  },

  // Core exercises
  {
    name: 'Bicycle Crunches',
    category: EXERCISE_CATEGORIES.CORE,
    description: 'Abdominales en bicicleta',
    default_duration: 30,
    muscle_groups: JSON.stringify(['core', 'abs']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 20,
    default_sets: 3,
    rest_between_sets: 45,
    equipment: JSON.stringify([]),
    instructions: 'Acostado, lleva codo derecho hacia rodilla izquierda y viceversa, como pedaleando.',
  },

  {
    name: 'Dead Bug',
    category: EXERCISE_CATEGORIES.CORE,
    description: 'Ejercicio de estabilidad core',
    default_duration: 45,
    muscle_groups: JSON.stringify(['core', 'stability']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.REP_BASED,
    default_reps: 10,
    default_sets: 3,
    rest_between_sets: 60,
    equipment: JSON.stringify([]),
    instructions: 'Boca arriba, brazos arriba y rodillas a 90°. Baja brazo y pierna opuestos sin mover la espalda.',
  },

  // HIIT variations
  {
    name: 'High Knees',
    category: EXERCISE_CATEGORIES.HIIT,
    description: 'Rodillas al pecho en el lugar',
    default_duration: 30,
    muscle_groups: JSON.stringify(['cardio', 'legs', 'core']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 3,
    rest_between_sets: 30,
    equipment: JSON.stringify([]),
    instructions: 'Corre en el lugar llevando las rodillas lo más alto posible hacia el pecho.',
  },

  {
    name: 'Butt Kickers',
    category: EXERCISE_CATEGORIES.HIIT,
    description: 'Talones a glúteos corriendo en el lugar',
    default_duration: 30,
    muscle_groups: JSON.stringify(['cardio', 'legs']),
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    is_default: 1,
    exercise_type: EXERCISE_TYPES.TIME_BASED,
    default_reps: null,
    default_sets: 3,
    rest_between_sets: 30,
    equipment: JSON.stringify([]),
    instructions: 'Corre en el lugar intentando tocar los glúteos con los talones.',
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
// Block structure for advanced workout configuration
export const createEmptyBlock = (type = BLOCK_TYPES.EXERCISE) => {
  const baseBlock = {
    id: Date.now() + Math.random(),
    type,
    order: 0,
  };

  switch (type) {
    case BLOCK_TYPES.EXERCISE:
      return {
        ...baseBlock,
        exercise_name: '',
        exercise_type: EXERCISE_TYPES.TIME_BASED,
        duration: 30,
        reps: null,
        sets: 1,
        rest_between_sets: 60,
        intensity: 'medium', // low, medium, high
        notes: '',
      };

    case BLOCK_TYPES.SET_GROUP:
      return {
        ...baseBlock,
        structure_type: SET_STRUCTURES.STRAIGHT_SET,
        exercises: [], // Array of exercise blocks
        sets: 3,
        rest_between_sets: 90,
        rest_between_exercises: 30,
        notes: '',
      };

    case BLOCK_TYPES.REST:
      return {
        ...baseBlock,
        exercise_name: 'Descanso',
        duration: 60,
        rest_type: 'passive', // passive, active
      };

    case BLOCK_TYPES.PREPARATION:
      return {
        ...baseBlock,
        exercise_name: 'Preparación',
        duration: 60,
        prep_type: 'warm_up', // warm_up, setup
      };

    default:
      return baseBlock;
  }
};

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

  return blocks.reduce((total, block) => {
    let blockDuration = 0;

    switch (block.type) {
      case BLOCK_TYPES.EXERCISE:
        if (block.exercise_type === EXERCISE_TYPES.TIME_BASED) {
          blockDuration = (block.duration || 0) * (block.sets || 1);
          if (block.sets > 1) {
            blockDuration += (block.rest_between_sets || 0) * (block.sets - 1);
          }
        } else if (block.exercise_type === EXERCISE_TYPES.REP_BASED) {
          // Estimate time based on reps (roughly 2 seconds per rep)
          const estimatedTimePerSet = Math.max((block.reps || 0) * 2, 15);
          blockDuration = estimatedTimePerSet * (block.sets || 1);
          if (block.sets > 1) {
            blockDuration += (block.rest_between_sets || 0) * (block.sets - 1);
          }
        }
        break;

      case BLOCK_TYPES.SET_GROUP:
        // Calculate duration for set groups (supersets, circuits, etc.)
        const exerciseDuration = block.exercises?.reduce((sum, exercise) => {
          const exerciseTime = exercise.exercise_type === EXERCISE_TYPES.TIME_BASED
            ? exercise.duration || 0
            : Math.max((exercise.reps || 0) * 2, 15);
          return sum + exerciseTime;
        }, 0) || 0;

        blockDuration = exerciseDuration * (block.sets || 1);

        // Add rest between exercises within sets
        const restBetweenExercises = (block.exercises?.length || 0) > 1
          ? (block.rest_between_exercises || 0) * ((block.exercises?.length || 0) - 1) * (block.sets || 1)
          : 0;

        // Add rest between sets
        const restBetweenSets = block.sets > 1
          ? (block.rest_between_sets || 0) * (block.sets - 1)
          : 0;

        blockDuration += restBetweenExercises + restBetweenSets;
        break;

      case BLOCK_TYPES.REST:
      case BLOCK_TYPES.PREPARATION:
        blockDuration = block.duration || 0;
        break;

      default:
        blockDuration = block.duration || 0;
    }

    return total + blockDuration;
  }, 0);
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