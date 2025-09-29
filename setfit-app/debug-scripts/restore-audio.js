/**
 * Script para restaurar AudioService original
 */

const fs = require('fs');
const path = require('path');

const audioServicePath = path.join(__dirname, '../src/services/AudioService.js');
const backupPath = path.join(__dirname, 'AudioService.backup.js');

console.log('🔊 Restaurando AudioService original...');

try {
  if (!fs.existsSync(backupPath)) {
    console.error('❌ No se encontró el backup. No se puede restaurar.');
    process.exit(1);
  }

  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(audioServicePath, backupContent);
  fs.unlinkSync(backupPath);

  console.log('✅ AudioService restaurado correctamente');
  console.log('🗑️  Backup eliminado');

} catch (error) {
  console.error('❌ Error al restaurar AudioService:', error);
  process.exit(1);
}