/**
 * Script para restaurar el timer original en beginActiveWorkout
 */

const fs = require('fs');
const path = require('path');

const hookPath = path.join(__dirname, '../src/hooks/useWorkoutExecution.js');
const backupPath = path.join(__dirname, 'useWorkoutExecution.backup.js');

console.log('⏰ Restaurando timer original en beginActiveWorkout...');

try {
  if (!fs.existsSync(backupPath)) {
    console.error('❌ No se encontró el backup. No se puede restaurar.');
    process.exit(1);
  }

  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(hookPath, backupContent);
  fs.unlinkSync(backupPath);

  console.log('✅ Timer restaurado correctamente');
  console.log('🗑️  Backup eliminado');

} catch (error) {
  console.error('❌ Error al restaurar timer:', error);
  process.exit(1);
}