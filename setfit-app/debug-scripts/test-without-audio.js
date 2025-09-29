/**
 * Script de prueba A/B: Desactivar temporalmente audio/haptics
 *
 * Este script modifica temporalmente el AudioService para desactivar
 * completamente el audio y las vibraciones para probar si son la causa
 * del crash durante beginActiveWorkout.
 *
 * Uso:
 * 1. Ejecutar: node debug-scripts/test-without-audio.js
 * 2. Probar la app
 * 3. Para restaurar: node debug-scripts/restore-audio.js
 */

const fs = require('fs');
const path = require('path');

const audioServicePath = path.join(__dirname, '../src/services/AudioService.js');
const backupPath = path.join(__dirname, 'AudioService.backup.js');

console.log('🔇 Desactivando Audio/Haptics temporalmente para pruebas...');

try {
  // Crear backup
  const originalContent = fs.readFileSync(audioServicePath, 'utf8');
  fs.writeFileSync(backupPath, originalContent);

  // Crear versión sin audio/haptics
  const modifiedContent = originalContent
    .replace(/this\.soundsEnabled = true;/, 'this.soundsEnabled = false;')
    .replace(/this\.vibrationsEnabled = true;/, 'this.vibrationsEnabled = false;')
    .replace(/async playSound\(soundName, options = {}\) {[\s\S]*?^  }/gm,
      `async playSound(soundName, options = {}) {
    // TEMPORARILY DISABLED FOR TESTING
    console.log('[TEST] Audio disabled - would play:', soundName);
    return Promise.resolve();
  }`)
    .replace(/async vibrate\(pattern\) {[\s\S]*?^  }/gm,
      `async vibrate(pattern) {
    // TEMPORARILY DISABLED FOR TESTING
    console.log('[TEST] Haptics disabled - would vibrate:', pattern);
    return Promise.resolve();
  }`)
    .replace(/async playExerciseStart\(\) {[\s\S]*?^  }/gm,
      `async playExerciseStart() {
    // TEMPORARILY DISABLED FOR TESTING
    console.log('[TEST] playExerciseStart() disabled');
    return Promise.resolve();
  }`);

  fs.writeFileSync(audioServicePath, modifiedContent);

  console.log('✅ Audio/Haptics desactivado temporalmente');
  console.log('📁 Backup guardado en:', backupPath);
  console.log('');
  console.log('🧪 INSTRUCCIONES DE PRUEBA:');
  console.log('1. Ejecutar la app y probar la transición de countdown → beginActiveWorkout');
  console.log('2. Si NO hay crash, el problema está en audio/haptics');
  console.log('3. Para restaurar: node debug-scripts/restore-audio.js');
  console.log('');

} catch (error) {
  console.error('❌ Error al modificar AudioService:', error);
  process.exit(1);
}