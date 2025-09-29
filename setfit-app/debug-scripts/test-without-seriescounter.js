/**
 * Script de prueba A/B: Desactivar temporalmente el renderizado de SeriesCounter
 *
 * Este script modifica temporalmente WorkoutExecutionScreen para no renderizar
 * SeriesCounter cuando workoutState cambia a ACTIVE, permitiendo aislar si
 * ese componente es la causa del crash.
 */

const fs = require('fs');
const path = require('path');

const screenPath = path.join(__dirname, '../src/screens/WorkoutExecutionScreen.js');
const backupPath = path.join(__dirname, 'WorkoutExecutionScreen.backup.js');

console.log('🎯 Desactivando renderizado de SeriesCounter temporalmente para pruebas...');

try {
  // Crear backup
  const originalContent = fs.readFileSync(screenPath, 'utf8');
  fs.writeFileSync(backupPath, originalContent);

  // Crear versión sin SeriesCounter renderizado
  const modifiedContent = originalContent
    .replace(
      /\{currentBlock && workoutState !== WORKOUT_STATES\.PREPARING && \([\s\S]*?<SeriesCounter[\s\S]*?\/>\s*\)\}/,
      `{/* TEMPORARILY DISABLED FOR TESTING - SeriesCounter removed */
          currentBlock && workoutState !== WORKOUT_STATES.PREPARING && (
            <View style={styles.seriesCounter}>
              <Text style={{color: 'white', textAlign: 'center', padding: 20}}>
                [TEST] SeriesCounter disabled
              </Text>
              <Text style={{color: 'gray', textAlign: 'center'}}>
                Block: {currentBlock?.exercise_name || 'Unknown'}
              </Text>
              <Text style={{color: 'gray', textAlign: 'center'}}>
                Set: {currentSet} / {currentBlock?.sets || 1}
              </Text>
            </View>
          )}`
    );

  fs.writeFileSync(screenPath, modifiedContent);

  console.log('✅ SeriesCounter renderizado desactivado temporalmente');
  console.log('📁 Backup guardado en:', backupPath);
  console.log('');
  console.log('🧪 INSTRUCCIONES DE PRUEBA:');
  console.log('1. Ejecutar la app y probar la transición de countdown → beginActiveWorkout');
  console.log('2. Si NO hay crash, el problema está en SeriesCounter');
  console.log('3. Para restaurar: node debug-scripts/restore-seriescounter.js');
  console.log('');

} catch (error) {
  console.error('❌ Error al modificar WorkoutExecutionScreen:', error);
  process.exit(1);
}