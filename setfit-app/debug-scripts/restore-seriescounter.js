/**
 * Script para restaurar el renderizado original de SeriesCounter
 */

const fs = require('fs');
const path = require('path');

const screenPath = path.join(__dirname, '../src/screens/WorkoutExecutionScreen.js');
const backupPath = path.join(__dirname, 'WorkoutExecutionScreen.backup.js');

console.log('🎯 Restaurando renderizado original de SeriesCounter...');

try {
  if (!fs.existsSync(backupPath)) {
    console.error('❌ No se encontró el backup. No se puede restaurar.');
    process.exit(1);
  }

  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(screenPath, backupContent);
  fs.unlinkSync(backupPath);

  console.log('✅ SeriesCounter renderizado restaurado correctamente');
  console.log('🗑️  Backup eliminado');

} catch (error) {
  console.error('❌ Error al restaurar SeriesCounter:', error);
  process.exit(1);
}