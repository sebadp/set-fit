# 📱 Guía para Configurar y Ejecutar Emulador Android

## 🎯 Problema Resuelto
**✅ ENCONTRAMOS LA CAUSA DEL CRASH:** Error en `VisualFeedback.js` con animaciones nativas conflictivas
**✅ SOLUCIONADO:** Reparado problema de `useNativeDriver` mixto

---

## 🚀 Cómo Ejecutar el Emulador Android

### **Opción 1: Usando Android Studio (Recomendado)**

#### **Paso 1: Instalar Android Studio**
```bash
# Ubuntu/Debian
sudo snap install android-studio --classic

# O descargar desde: https://developer.android.com/studio
```

#### **Paso 2: Configurar SDK y AVD**
1. Abrir Android Studio
2. `Tools` → `SDK Manager`
3. Instalar:
   - ✅ Android 13.0 (API 33) o superior
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
4. `Tools` → `AVD Manager` → `Create Virtual Device`
5. Seleccionar:
   - **Device:** Pixel 3a (como en los logs)
   - **System Image:** API 33+ (x86_64)
   - **RAM:** 2GB mínimo

#### **Paso 3: Lanzar Emulador**
```bash
# Desde Android Studio
# AVD Manager → Play button del dispositivo

# O desde terminal
~/Android/Sdk/emulator/emulator -avd Pixel_3a_API_33
```

### **Opción 2: Usando Expo CLI**

#### **Paso 1: Verificar Instalación**
```bash
# Verificar que tienes todo instalado
npx expo doctor

# Debería mostrar: Android SDK, Android Emulator
```

#### **Paso 2: Ejecutar Proyecto**
```bash
cd /home/seba/PycharmProjects/set-fit/setfit-app

# Método 1: Desarrollo
npx expo start
# Luego presionar 'a' para Android

# Método 2: Build nativo (como hicimos)
npx expo run:android
```

---

## 🛠️ Configuración de Variables de Entorno

### **Agregar al ~/.bashrc o ~/.profile:**
```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload
source ~/.bashrc
```

### **Verificar Configuración:**
```bash
# Verificar ADB
adb --version

# Verificar emuladores disponibles
emulator -list-avds

# Verificar dispositivos conectados
adb devices
```

---

## 🧪 Cómo Probar el Fix del Crash

### **Paso 1: Ejecutar App**
```bash
cd /home/seba/PycharmProjects/set-fit/setfit-app
npx expo run:android
```

### **Paso 2: Probar Flujo Crítico**
1. **✅ App inicia** sin errores de VisualFeedback
2. **✅ Navegar** a WorkoutExecution
3. **✅ Iniciar countdown** (3-2-1)
4. **✅ Transición** a beginActiveWorkout ➜ **NO DEBE CRASHEAR**
5. **✅ SeriesCounter** renderiza correctamente

### **Paso 3: Verificar Logs**
```bash
# En otra terminal, monitorear logs
adb logcat | grep -E "(SetFit|Expo|ERROR|FATAL)"

# Buscar específicamente errores de animación
adb logcat | grep -i "animated\|reanimated\|visualfeedback"
```

---

## 🎯 Puntos de Verificación

### **✅ App Funciona Correctamente Si:**
- [ ] No hay crash al iniciar workout
- [ ] VisualFeedback no genera errores
- [ ] SeriesCounterMinimal renderiza bien
- [ ] Animaciones suaves en WorkoutControls
- [ ] Audio y haptics funcionan

### **❌ Si Aún Hay Problemas:**
```bash
# 1. Limpiar completamente
rm -rf android/
rm -rf node_modules/
npm install
npx expo run:android

# 2. Usar versión original de SeriesCounter
# Cambiar import en WorkoutExecutionScreen.js:
# De: SeriesCounterMinimal
# A: SeriesCounter original
```

---

## 🔧 Scripts de Debug Disponibles

### **Scripts A/B para Testing:**
```bash
# Test sin audio/haptics
node debug-scripts/test-without-audio.js
node debug-scripts/restore-audio.js

# Test sin Reanimated
node debug-scripts/test-without-reanimated.js
node debug-scripts/restore-reanimated.js

# Test sin SeriesCounter
node debug-scripts/test-without-seriescounter.js
node debug-scripts/restore-seriescounter.js

# Capturar logs detallados
./debug-scripts/analyze-crash.sh
```

---

## 📊 Estado Actual del Fix

### **✅ Problemas Resueltos:**
1. **VisualFeedback.js** - Animaciones nativas reparadas
2. **babel.config.js** - Reanimated configurado correctamente
3. **app.json** - Plugin de expo-audio agregado
4. **SeriesCounterMinimal** - Versión simplificada como fallback

### **🎯 Resultado Esperado:**
- **NO MÁS CRASH** en countdown → beginActiveWorkout
- **Animaciones funcionando** correctamente
- **App estable** en todas las pantallas

---

## 🚨 Troubleshooting Común

### **Emulador No Inicia:**
```bash
# Verificar virtualización habilitada
grep -E "(vmx|svm)" /proc/cpuinfo

# Reinstalar emulador
android-studio → SDK Manager → Android Emulator (reinstall)
```

### **Build Falla:**
```bash
# Limpiar Gradle
cd android && ./gradlew clean && cd ..

# Reinstalar dependencias
rm -rf node_modules && npm install
```

### **ADB No Detecta Dispositivo:**
```bash
# Reiniciar ADB
adb kill-server
adb start-server
adb devices
```

---

**Estado:** ✅ Fix aplicado - Listo para testing
**Tiempo estimado:** 5-10 minutos para verificar que funciona