#!/bin/bash
# Script automatizado para capturar y analizar logs de crash

echo "🔍 Iniciando análisis de crash SetFit..."
echo "⚠️  Asegúrate de que tu dispositivo Android esté conectado y configurado"

# Verificar adb
if ! command -v adb &> /dev/null; then
    echo "❌ adb no encontrado. Instala Android SDK Platform Tools."
    exit 1
fi

# Verificar dispositivos
devices=$(adb devices | grep -v "List of devices" | grep "device$")
if [ -z "$devices" ]; then
    echo "❌ No se encontraron dispositivos Android conectados."
    echo "   Conecta tu dispositivo y habilita USB Debugging."
    exit 1
fi

echo "📱 Dispositivos encontrados:"
echo "$devices"

# Limpiar logs anteriores
echo "🧹 Limpiando logs anteriores..."
adb logcat -c

# Crear directorio para logs si no existe
mkdir -p logs
timestamp=$(date +"%Y%m%d_%H%M%S")

echo ""
echo "🚀 INSTRUCCIONES:"
echo "1. Inicia la app SetFit"
echo "2. Navega hasta Workout Execution"
echo "3. Inicia el countdown (3-2-1)"
echo "4. Observa cuando ocurra el crash"
echo "5. Presiona Ctrl+C aquí para terminar la captura"
echo ""
echo "📊 Capturando logs..."

# Capturar logs con múltiples filtros
adb logcat -v time 2>&1 | tee "logs/full_crash_${timestamp}.log" | \
grep -E -i "(setfit|expo|reanimated|audio|haptic|fatal|crash|exception|signal|tombstone|worklet|babel|hermes)" | \
tee "logs/filtered_crash_${timestamp}.log"

echo ""
echo "📋 Análisis completado!"
echo "📁 Archivos generados:"
echo "   - logs/full_crash_${timestamp}.log: Logs completos"
echo "   - logs/filtered_crash_${timestamp}.log: Logs filtrados"
echo ""
echo "🔍 Buscando patrones de error comunes..."

# Análisis automático
echo "--- RESUMEN DE ERRORES ---"
grep -i -E "(fatal|exception|crash|signal)" "logs/filtered_crash_${timestamp}.log" | head -10

echo ""
echo "--- ERRORES DE REANIMATED ---"
grep -i -E "(reanimated|worklet|babel)" "logs/filtered_crash_${timestamp}.log" | head -5

echo ""
echo "--- ERRORES DE AUDIO/HAPTICS ---"
grep -i -E "(audio|haptic|expo-av)" "logs/filtered_crash_${timestamp}.log" | head -5

echo ""
echo "✅ Revisa los archivos de log para un análisis más detallado."