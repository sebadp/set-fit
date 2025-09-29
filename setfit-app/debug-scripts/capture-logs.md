# Comandos para Capturar Logs Nativos

## Android (adb logcat)

### 1. Preparar dispositivo/emulador
```bash
# Verificar dispositivos conectados
adb devices

# Si hay múltiples dispositivos, especificar con -s <device_id>
adb -s <device_id> logcat
```

### 2. Capturar logs durante el crash
```bash
# Limpiar logs existentes
adb logcat -c

# Capturar logs filtrados por la app SetFit
adb logcat | grep -i "setfit\|expo\|reanimated\|audio\|haptic"

# O capturar todos los logs con timestamp
adb logcat -v time > crash_logs.txt

# Capturar solo errores y warnings
adb logcat *:E *:W > error_logs.txt
```

### 3. Logs específicos para nuestras hipótesis

#### Para problemas de Reanimated:
```bash
adb logcat | grep -i "reanimated\|worklet\|babel\|hermes"
```

#### Para problemas de Audio/Haptics:
```bash
adb logcat | grep -i "audio\|haptic\|vibrat\|expo-av\|sound"
```

#### Para crashes nativos:
```bash
adb logcat | grep -i "fatal\|crash\|exception\|signal\|tombstone"
```

### 4. Procedimiento de captura durante testing

1. **Antes de ejecutar la app:**
   ```bash
   adb logcat -c  # Limpiar logs
   adb logcat -v time | tee crash_analysis.log  # Comenzar captura
   ```

2. **Reproducir el crash:**
   - Abrir la app
   - Navegar hasta WorkoutExecution
   - Iniciar countdown
   - Observar el momento exacto del crash

3. **Analizar inmediatamente después del crash:**
   ```bash
   # En otra terminal, buscar patrones
   grep -i "setfit\|crash\|fatal\|exception" crash_analysis.log
   ```

## iOS (Console.app o Xcode)

### 1. Usando Xcode
```bash
# Conectar dispositivo iOS y abrir Xcode
# Window > Devices and Simulators > Seleccionar dispositivo > View Device Logs
```

### 2. Usando Console.app (macOS)
```
1. Abrir Console.app
2. Seleccionar dispositivo iOS en la barra lateral
3. Filtrar por "SetFit" o "expo"
4. Reproducir el crash
```

### 3. Usando instrumentos de línea de comandos
```bash
# Si tienes iOS 16+ con consola habilitada
idevicesyslog | grep -i "setfit\|expo\|reanimated"
```

## Logs de Metro/Expo

### Development Server
```bash
# Si usas expo start
expo start --clear

# Si usas npx expo start
npx expo start --clear --verbose
```

### Build Logs
```bash
# Para builds de desarrollo
npx expo run:android --variant debug --verbose

# Para capturar logs de EAS Build
eas build --platform android --profile development --local --verbose
```

## Patrones de Error a Buscar

### 1. Crashes de Reanimated
- "Worklet"
- "react-native-reanimated"
- "babel-plugin"
- "Hermes"
- "JSI"

### 2. Crashes de Audio/Haptics
- "expo-audio"
- "expo-haptics"
- "AudioManager"
- "Vibrator"
- "MediaPlayer"

### 3. Crashes de memoria/rendimiento
- "OutOfMemoryError"
- "ANR"
- "GC"
- "Memory pressure"

### 4. Crashes de SQLite
- "sqlite"
- "database"
- "SQLITE_BUSY"
- "SQLITE_LOCKED"

## Script Automatizado para Análisis

```bash
#!/bin/bash
# save as debug-scripts/analyze-crash.sh

echo "🔍 Iniciando análisis de crash..."

# Limpiar logs
adb logcat -c

echo "📱 Inicia la app y reproduce el crash. Presiona Ctrl+C cuando termine."

# Capturar logs con múltiples filtros
adb logcat -v time | tee full_crash.log | grep -E "(setfit|expo|reanimated|audio|haptic|fatal|crash|exception)" | tee filtered_crash.log

echo "📋 Análisis completado. Revisar archivos:"
echo "- full_crash.log: Logs completos"
echo "- filtered_crash.log: Logs filtrados"
```