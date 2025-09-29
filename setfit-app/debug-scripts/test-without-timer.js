/**
 * Script de prueba A/B: Desactivar temporalmente el timer en beginActiveWorkout
 *
 * Este script modifica temporalmente beginActiveWorkout para evitar el setInterval
 * que puede estar causando el crash si hay problemas de memoria o threading.
 */

const fs = require('fs');
const path = require('path');

const hookPath = path.join(__dirname, '../src/hooks/useWorkoutExecution.js');
const backupPath = path.join(__dirname, 'useWorkoutExecution.backup.js');

console.log('⏰ Desactivando Timer en beginActiveWorkout temporalmente para pruebas...');

try {
  // Crear backup
  const originalContent = fs.readFileSync(hookPath, 'utf8');
  fs.writeFileSync(backupPath, originalContent);

  // Crear versión sin timer en beginActiveWorkout
  const modifiedContent = originalContent
    .replace(/\/\/ Begin active workout \(after preparation\)[\s\S]*?console\.log\('Active workout started successfully'\);/,
      `// Begin active workout (after preparation) - TIMER DISABLED FOR TESTING
  const beginActiveWorkout = useCallback(() => {
    try {
      console.log('beginActiveWorkout called, current state:', workoutState);
      console.log('[TEST] Timer disabled - beginActiveWorkout simplified');

      if (workoutState !== WORKOUT_STATES.PREPARING) {
        console.warn('Cannot begin active workout, invalid state:', workoutState);
        return;
      }

      // Just change state - NO TIMER
      setWorkoutState(WORKOUT_STATES.ACTIVE);
      console.log('[TEST] Active workout started successfully - NO TIMER');
    } catch (error) {
      console.error('Error in beginActiveWorkout:', error);
      throw error;
    }`);

  fs.writeFileSync(hookPath, modifiedContent);

  console.log('✅ Timer en beginActiveWorkout desactivado temporalmente');
  console.log('📁 Backup guardado en:', backupPath);
  console.log('');
  console.log('🧪 INSTRUCCIONES DE PRUEBA:');
  console.log('1. Ejecutar la app y probar la transición de countdown → beginActiveWorkout');
  console.log('2. Si NO hay crash, el problema está en el setInterval del timer');
  console.log('3. Para restaurar: node debug-scripts/restore-timer.js');
  console.log('');

} catch (error) {
  console.error('❌ Error al modificar useWorkoutExecution:', error);
  process.exit(1);
}