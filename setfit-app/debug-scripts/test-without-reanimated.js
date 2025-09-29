/**
 * Script de prueba A/B: Desactivar temporalmente Reanimated
 *
 * Este script modifica temporalmente los componentes para usar animaciones básicas
 * de React Native en lugar de Reanimated para probar si la falta de configuración
 * de Reanimated es la causa del crash.
 */

const fs = require('fs');
const path = require('path');

const seriesCounterPath = path.join(__dirname, '../src/components/workout/SeriesCounter.js');
const workoutControlsPath = path.join(__dirname, '../src/components/workout/WorkoutControls.js');
const backupDir = path.join(__dirname, 'backups');

console.log('⚡ Desactivando Reanimated temporalmente para pruebas...');

try {
  // Crear directorio de backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Backup SeriesCounter
  const seriesCounterContent = fs.readFileSync(seriesCounterPath, 'utf8');
  fs.writeFileSync(path.join(backupDir, 'SeriesCounter.backup.js'), seriesCounterContent);

  // Backup WorkoutControls
  const workoutControlsContent = fs.readFileSync(workoutControlsPath, 'utf8');
  fs.writeFileSync(path.join(backupDir, 'WorkoutControls.backup.js'), workoutControlsContent);

  // Modificar SeriesCounter - reemplazar Reanimated con View básico
  const modifiedSeriesCounter = seriesCounterContent
    .replace(/import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';/,
             '// TEMPORARILY DISABLED: import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from \'react-native-reanimated\';')
    .replace(/const opacity = useSharedValue\(0\);/, 'const opacity = { value: 1 }; // MOCK')
    .replace(/const scale = useSharedValue\(1\);/, 'const scale = { value: 1 }; // MOCK')
    .replace(/opacity\.value = withTiming\(1, { duration: 500 }\);/, '// DISABLED: opacity animation')
    .replace(/scale\.value = withSpring\([^;]+;/g, '// DISABLED: scale animation')
    .replace(/const animatedDisplayStyle = useAnimatedStyle[\s\S]*?}\);/,
             `const animatedDisplayStyle = {
    opacity: 1,
    transform: [{ scale: 1 }],
  }; // MOCK ANIMATED STYLE`)
    .replace(/const animatedContainerStyle = useAnimatedStyle[\s\S]*?}\);/,
             `const animatedContainerStyle = {
    opacity: 1,
  }; // MOCK ANIMATED STYLE`)
    .replace(/<Animated\.View/g, '<View // MOCK ANIMATED')
    .replace(/animatedDisplayStyle/g, '{}')
    .replace(/animatedContainerStyle/g, '{}');

  // Modificar WorkoutControls - reemplazar Reanimated con View básico
  const modifiedWorkoutControls = workoutControlsContent
    .replace(/import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';/,
             '// TEMPORARILY DISABLED: import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from \'react-native-reanimated\';')
    .replace(/const opacity = useSharedValue\(0\);/, 'const opacity = { value: 1 }; // MOCK')
    .replace(/const translateY = useSharedValue\(-40\);/, 'const translateY = { value: 0 }; // MOCK')
    .replace(/opacity\.value = withTiming[\s\S]*?}\);/, '// DISABLED: opacity animation')
    .replace(/translateY\.value = withSpring[\s\S]*?}\);/, '// DISABLED: translateY animation')
    .replace(/const animatedContainerStyle = useAnimatedStyle[\s\S]*?}\);/,
             `const animatedContainerStyle = {
    opacity: 1,
    transform: [{ translateY: 0 }],
  }; // MOCK ANIMATED STYLE`)
    .replace(/<Animated\.View/g, '<View // MOCK ANIMATED')
    .replace(/animatedContainerStyle/g, '{}');

  // Escribir archivos modificados
  fs.writeFileSync(seriesCounterPath, modifiedSeriesCounter);
  fs.writeFileSync(workoutControlsPath, modifiedWorkoutControls);

  console.log('✅ Reanimated desactivado temporalmente');
  console.log('📁 Backups guardados en:', backupDir);
  console.log('');
  console.log('🧪 INSTRUCCIONES DE PRUEBA:');
  console.log('1. Ejecutar la app y probar la transición de countdown → beginActiveWorkout');
  console.log('2. Si NO hay crash, el problema está en la configuración de Reanimated');
  console.log('3. Para restaurar: node debug-scripts/restore-reanimated.js');
  console.log('');

} catch (error) {
  console.error('❌ Error al modificar componentes:', error);
  process.exit(1);
}