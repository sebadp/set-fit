/**
 * Script para restaurar los componentes originales con Reanimated
 */

const fs = require('fs');
const path = require('path');

const seriesCounterPath = path.join(__dirname, '../src/components/workout/SeriesCounter.js');
const workoutControlsPath = path.join(__dirname, '../src/components/workout/WorkoutControls.js');
const backupDir = path.join(__dirname, 'backups');

console.log('⚡ Restaurando componentes originales con Reanimated...');

try {
  const seriesCounterBackup = path.join(backupDir, 'SeriesCounter.backup.js');
  const workoutControlsBackup = path.join(backupDir, 'WorkoutControls.backup.js');

  if (!fs.existsSync(seriesCounterBackup) || !fs.existsSync(workoutControlsBackup)) {
    console.error('❌ No se encontraron los backups. No se puede restaurar.');
    process.exit(1);
  }

  // Restaurar archivos
  const seriesCounterContent = fs.readFileSync(seriesCounterBackup, 'utf8');
  const workoutControlsContent = fs.readFileSync(workoutControlsBackup, 'utf8');

  fs.writeFileSync(seriesCounterPath, seriesCounterContent);
  fs.writeFileSync(workoutControlsPath, workoutControlsContent);

  // Limpiar backups
  fs.unlinkSync(seriesCounterBackup);
  fs.unlinkSync(workoutControlsBackup);
  fs.rmdirSync(backupDir);

  console.log('✅ Componentes restaurados correctamente');
  console.log('🗑️  Backups eliminados');

} catch (error) {
  console.error('❌ Error al restaurar componentes:', error);
  process.exit(1);
}