# 🚨 Plan B: Análisis de Crash Revisado

## 📊 Estado Actual de Tests A/B

### ✅ Tests Ejecutados

1. **✅ Audio/Haptics DESACTIVADO**
   - Script ejecutado: `test-without-audio.js`
   - Estado: Componentes no reproducen audio ni vibran

2. **✅ Reanimated DESACTIVADO**
   - Script ejecutado: `test-without-reanimated.js`
   - Estado: SeriesCounter y WorkoutControls usan Views básicos

3. **✅ SeriesCounter DESACTIVADO**
   - Script ejecutado: `test-without-seriescounter.js`
   - Estado: Se renderiza placeholder simple en lugar del componente completo

### 🎯 **Nueva Hipótesis Principal**

**El problema está en el renderizado condicional de SeriesCounter cuando `workoutState` cambia de `PREPARING` a `ACTIVE`**

```javascript
// Línea crítica en WorkoutExecutionScreen.js:596
{currentBlock && workoutState !== WORKOUT_STATES.PREPARING && (
  <SeriesCounter ... />
)}
```

**Cuando `beginActiveWorkout()` ejecuta `setWorkoutState(WORKOUT_STATES.ACTIVE)`, React intenta renderizar SeriesCounter por primera vez, causando el crash.**

---

## 🧪 Plan de Pruebas Actualizado

### **Fase 1: Confirmar Hipótesis** ⏳
```bash
# EJECUTAR AHORA - Probar sin SeriesCounter
# Si NO crashea = SeriesCounter es el problema
# Si SÍ crashea = Problema está en otro lado

# 1. Build APK con SeriesCounter desactivado
npx expo run:android --clear

# 2. Probar transición countdown → beginActiveWorkout
# 3. Observar si pasa sin crash
```

### **Fase 2: Si SeriesCounter ES el problema**
```bash
# Restaurar SeriesCounter y probar componentes individuales
node debug-scripts/restore-seriescounter.js

# Crear tests granulares:
# - Test solo con SeriesCounter básico (sin animaciones)
# - Test solo con WorkoutControls
# - Test con ambos pero sin useEffect complejos
```

### **Fase 3: Si SeriesCounter NO es el problema**
```bash
# Investigar otras causas:
# - WorkoutControls rendering
# - Timer en beginActiveWorkout
# - Estado de React/memoria
# - Problemas de SQLite
```

---

## 🔍 Causas Más Probables (Actualizadas)

### **1. SeriesCounter Rendering (ALTA - 85%)**
**Por qué:**
- SeriesCounter tiene 470+ líneas de código complejo
- Usa múltiples hooks (useState, useEffect, useCallback, memo)
- Renderizado condicional exactamente en el punto del crash
- Muchas operaciones de cálculo en cada render

**Evidencia:**
```javascript
// En SeriesCounter.js - Operaciones pesadas en render
const getProgressPercentage = () => {
  if (isTimeBased) {
    const targetTime = block?.duration || 0;
    return targetTime > 0 ? Math.min((timer / targetTime) * 100, 100) : 0;
  } else {
    const targetReps = block?.reps || 0;
    return targetReps > 0 ? Math.min((localReps / targetReps) * 100, 100) : 0;
  }
};
```

### **2. WorkoutControls State Sync (MEDIA - 40%)**
**Por qué:** WorkoutControls también se renderiza en el cambio de estado
**Test:** Ya desactivado con Reanimated test

### **3. Timer setInterval (BAJA - 15%)**
**Por qué:** `beginActiveWorkout` inicia setInterval que podría conflictuar
**Test:** Crear `test-without-timer.js` (ya creado)

### **4. Memory/Performance (BAJA - 10%)**
**Por qué:** Muchos componentes renderizándose simultáneamente
**Solución:** Optimizar con React.memo, useMemo, useCallback

---

## 📋 Scripts A/B Disponibles

### **Tests Activos (YA APLICADOS)**
```bash
# ✅ APLICADO - Audio/Haptics desactivado
node debug-scripts/restore-audio.js    # Para restaurar

# ✅ APLICADO - Reanimated mock
node debug-scripts/restore-reanimated.js  # Para restaurar

# ✅ APLICADO - SeriesCounter desactivado
node debug-scripts/restore-seriescounter.js  # Para restaurar
```

### **Tests Adicionales Disponibles**
```bash
# Timer en beginActiveWorkout
node debug-scripts/test-without-timer.js
node debug-scripts/restore-timer.js

# Logs nativos
./debug-scripts/analyze-crash.sh
```

---

## 🚀 Siguientes Pasos Inmediatos

### **AHORA: Probar SeriesCounter Test**
```bash
# 1. Build con SeriesCounter desactivado (ya aplicado)
npx expo run:android --clear

# 2. Probar app:
#    - Navegar a WorkoutExecution
#    - Iniciar countdown (3-2-1)
#    - Observar transición a beginActiveWorkout
#    - ✅ Si NO crashea: SeriesCounter es el problema
#    - ❌ Si crashea: Problema en otro lugar
```

### **Si NO Crashea (SeriesCounter es el problema):**
```bash
# 1. Restaurar SeriesCounter
node debug-scripts/restore-seriescounter.js

# 2. Crear SeriesCounter simplificado
# 3. Agregar optimizaciones (React.memo, useMemo)
# 4. Test incremental
```

### **Si SÍ Crashea (Problema en otro lugar):**
```bash
# 1. Test Timer
node debug-scripts/test-without-timer.js
npx expo run:android --clear

# 2. Capturar logs nativos
./debug-scripts/analyze-crash.sh

# 3. Investigar WorkoutControls más profundo
```

---

## 🎯 Criterios de Éxito

### **Test de SeriesCounter**
- [ ] App inicia sin errores
- [ ] Countdown (3-2-1) completa
- [ ] Transición a beginActiveWorkout exitosa
- [ ] Placeholder de SeriesCounter visible
- [ ] WorkoutControls funciona normalmente
- [ ] No crash en logs nativos

### **Solución Final**
- [ ] SeriesCounter renderiza correctamente
- [ ] Animaciones funcionan (si Reanimated está OK)
- [ ] Audio/haptics funcionan
- [ ] Performance aceptable
- [ ] No regresiones

---

## 🔧 Herramientas de Debug

### **Logs y Análisis**
```bash
# Logs nativos detallados
./debug-scripts/analyze-crash.sh

# Logs específicos
adb logcat | grep -i "seriescounter\|workoutexecution\|expo"
```

### **Performance**
```bash
# React DevTools (si está disponible)
# Metro performance logs
npx expo start --dev-client --profile
```

### **Restaurar Estado Original**
```bash
# Restaurar todo a estado original
node debug-scripts/restore-audio.js
node debug-scripts/restore-reanimated.js
node debug-scripts/restore-seriescounter.js
node debug-scripts/restore-timer.js
```

---

**Estado:** Esperando resultados del test de SeriesCounter
**Próximo paso:** Build APK y probar transición crítica
**Tiempo estimado:** 15-30 minutos para confirmación