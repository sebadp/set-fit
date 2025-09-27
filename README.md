# FlowFit - Branding & Plan de Implementación

## 🎯 **Concepto de Marca**

### **Naming: FlowFit**
El nombre combina dos conceptos poderosos:
- **Flow**: Estado mental de concentración total, fluidez en el movimiento
- **Fit**: Fitness, estar en forma, encajar perfectamente en tu rutina

### **Tagline Principal**
> "Entrena a tu ritmo, fluye sin límites"

### **Taglines Secundarios**
- "Tu tiempo, tu tempo"
- "Simple. Fluido. Efectivo."
- "Del parque a tu bolsillo"

---

## 🎨 **Identidad Visual**

### **Paleta de Colores**

#### Colores Principales
- **Flow Red** `#FF6B6B` - Energía y motivación
- **Deep Flow** `#FF5252` - Intensidad y fuerza
- **Rest Blue** `#74B9FF` - Calma y recuperación

#### Colores Secundarios
- **Success Green** `#26DE81` - Logros y completitud
- **Dark Matter** `#2C3E50` - Textos y contraste
- **Light Cloud** `#F7F9FC` - Fondos y espacios

#### Gradientes Signature
```css
/* Hero Gradient */
background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);

/* Rest Gradient */
background: linear-gradient(135deg, #74B9FF 0%, #54A0FF 100%);

/* Success Gradient */
background: linear-gradient(135deg, #26DE81 0%, #20BF6B 100%);
```

### **Tipografía**
- **Principal**: Inter o SF Pro Display (moderna, legible, deportiva)
- **Números/Timer**: SF Mono o Roboto Mono (monoespaciada para contadores)
- **Pesos**: Regular (400), Semibold (600), Bold (700)

### **Iconografía**
- Estilo: Line icons minimalistas con bordes redondeados
- Grosor: 2px consistente
- Esquinas redondeadas para amigabilidad
- Set básico: ⚡ (logo), 💪 (ejercicio), ⏸️ (pausa), ▶️ (play), 🏆 (logro)

---

## 🎭 **Personalidad de Marca**

### **Arquetipos**
1. **El Compañero** (principal): Siempre presente, confiable, sin juzgar
2. **El Sabio** (secundario): Simple pero inteligente, eficiente

### **Tono de Voz**
- **Amigable**: "¡Vamos con todo!" en vez de "Iniciar sesión de entrenamiento"
- **Motivador**: "¡Increíble! 3 entrenamientos esta semana 🔥"
- **Directo**: Sin jerga técnica, instrucciones claras
- **Inclusivo**: Para todos los niveles, sin intimidar

### **Valores de Marca**
1. **Simplicidad**: Menos es más, solo lo esencial
2. **Accesibilidad**: Para todos, en cualquier lugar
3. **Autonomía**: Tú controlas tu entrenamiento
4. **Fluidez**: Sin fricciones, natural
5. **Comunidad**: Aunque entrenes solo, no estás solo

---

## 🎯 **Target & Posicionamiento**

### **Usuario Principal: "El Autónomo Activo"**
- **Edad**: 22-40 años
- **Contexto**: Entrena en casa, parques, gimnasios al aire libre
- **Pain Points**:
  - Cansado de apps sobrecargadas
  - Quiere controlar sus tiempos exactos
  - No necesita un "coach virtual" invasivo
  - Busca simplicidad sin perder funcionalidad

### **Usuarios Secundarios**
1. **Principiantes Tímidos**: Quieren empezar sin presión
2. **Veteranos Minimalistas**: Saben qué hacer, necesitan un timer inteligente
3. **Nómadas del Fitness**: Entrenan donde sea, cuando sea

### **Propuesta de Valor Única**
> "La única app que respeta tu forma de entrenar: simple como un cronómetro, inteligente como un coach, flexible como tú"

---

## 📱 **Plan de Implementación Técnica**

### **Stack Tecnológico**
- **Frontend**: React Native con Expo
- **Base de Datos**: SQLite (local) → PostgreSQL (futuro)
- **Estado**: Zustand o Context API
- **Estilos**: NativeWind (Tailwind para RN) o StyleSheet
- **Audio**: expo-av para sonidos
- **Animaciones**: Reanimated 3

---

## 🚀 **Roadmap de Desarrollo**

### **Sprint 0: Setup & Fundación** (3 días)
**Objetivo**: Ambiente listo y arquitectura base

**Entregables**:
- [ ] Inicializar proyecto Expo
- [ ] Configurar ESLint y Prettier
- [ ] Estructura de carpetas
- [ ] Componentes base (Button, Input, Card)
- [ ] Sistema de navegación (tabs)
- [ ] Tema y colores globales

**Estructura de carpetas**:
```
src/
├── components/
│   ├── common/
│   ├── exercises/
│   └── timer/
├── screens/
├── navigation/
├── utils/
├── constants/
└── assets/
```

---

### **Sprint 1: Timer Básico** (5 días)
**Objetivo**: MVP funcional con timer simple

**Entregables**:
- [ ] Pantalla de timer con contador regresivo
- [ ] Botones Play/Pause/Stop funcionales
- [ ] Input para tiempo personalizado
- [ ] Lógica de countdown con useEffect
- [ ] Componente TimerDisplay grande y claro
- [ ] Vibración al finalizar (Haptics)

**Componentes clave**:
```javascript
<TimerScreen />
<TimerDisplay time={seconds} />
<TimerControls onPlay={} onPause={} onStop={} />
```

---

### **Sprint 2: Sistema de Usuarios** (7 días)
**Objetivo**: Persistencia local con SQLite

**Entregables**:
- [ ] Integrar expo-sqlite
- [ ] Esquema de base de datos
- [ ] CRUD de perfil de usuario
- [ ] Pantalla de configuración
- [ ] Preferencias (sonidos, vibraciones)
- [ ] Sistema de backup local

**Schema SQLite**:
```sql
-- users
id, name, created_at, preferences_json

-- user_stats  
id, user_id, total_workouts, total_time
```

---

### **Sprint 3: Gestión de Rutinas** (10 días)
**Objetivo**: Crear y guardar rutinas personalizadas

**Entregables**:
- [ ] Pantalla de creación de rutinas
- [ ] Lista de rutinas guardadas
- [ ] CRUD completo de rutinas
- [ ] Componente RoutineCard
- [ ] Búsqueda y filtros
- [ ] Duplicar/editar rutinas
- [ ] Plantillas predefinidas

**Schema adicional**:
```sql
-- routines
id, user_id, name, description, created_at, last_used

-- routine_templates
id, name, category, difficulty, blocks_json
```

---

### **Sprint 4: Constructor de Ejercicios** (10 días)
**Objetivo**: Sistema drag & drop para crear secuencias

**Entregables**:
- [ ] Biblioteca de ejercicios predefinidos
- [ ] Crear ejercicios personalizados
- [ ] Bloques de ejercicio y descanso
- [ ] Drag & drop con react-native-draggable
- [ ] Configurar series y repeticiones
- [ ] Vista previa de la rutina
- [ ] Tiempo total estimado

**Schema adicional**:
```sql
-- exercises
id, name, category, default_time

-- routine_blocks
id, routine_id, exercise_id, duration, rest_time, order_index, series
```

**Componentes**:
```javascript
<ExerciseBlock exercise={} onDrag={} />
<RestBlock duration={} />
<RoutineBuilder blocks={} onReorder={} />
```

---

### **Sprint 5: Ejecución de Rutinas** (10 días)
**Objetivo**: Motor de ejecución con transiciones fluidas

**Entregables**:
- [ ] Estado de workout activo
- [ ] Transiciones entre ejercicios
- [ ] Contador de series
- [ ] Progreso visual de la rutina
- [ ] Pausa y reanudación
- [ ] Skip ejercicio
- [ ] Resumen al finalizar

**Estados del Workout**:
```javascript
{
  status: 'idle' | 'active' | 'paused' | 'completed',
  currentBlock: 0,
  currentSeries: 1,
  timeRemaining: 30,
  totalElapsed: 0
}
```

---

### **Sprint 6: Feedback Audiovisual** (7 días)
**Objetivo**: Alertas y feedback inmersivo

**Entregables**:
- [ ] Sistema de sonidos con expo-av
- [ ] Beeps de cuenta regresiva (3-2-1)
- [ ] Sonidos diferenciados (ejercicio/descanso)
- [ ] Vibración patterns diferentes
- [ ] Indicadores visuales (cambio de color)
- [ ] Voz TTS opcional para nombres
- [ ] Configuración de volumen

**Tipos de feedback**:
```javascript
const sounds = {
  countdown: [800Hz, 800Hz, 1200Hz], // 3-2-1
  exerciseStart: 1000Hz,
  restStart: 600Hz,
  workoutComplete: [1200Hz, 1500Hz, 1800Hz]
}
```

---

### **Sprint 7: Polish & Optimización** (5 días)
**Objetivo**: Pulir UX y performance

**Entregables**:
- [ ] Animaciones con Reanimated 3
- [ ] Modo oscuro
- [ ] Onboarding interactivo
- [ ] Optimización de renderizado
- [ ] Reducir bundle size
- [ ] Testing E2E básico
- [ ] Manejo de errores robusto

---

## 📊 **Métricas de Éxito**

### **KPIs Técnicos**
- Tiempo de carga < 2 segundos
- Crash rate < 0.1%
- Precisión del timer: ±100ms
- Tamaño APK < 15MB

### **KPIs de Usuario**
- Retención D7: >40%
- Sesiones por semana: >3
- Rutinas creadas en primera semana: >1
- Completion rate de workouts: >70%

---

## 🎪 **Estrategia de Lanzamiento**

### **Fase 1: Beta Cerrada** (Semana 1-2)
- 50 usuarios early adopters
- Grupo de WhatsApp para feedback
- Iteración rápida de bugs

### **Fase 2: Beta Abierta** (Semana 3-6)
- Lanzamiento en TestFlight/Play Console Beta
- 500 usuarios objetivo
- A/B testing de onboarding

### **Fase 3: Lanzamiento** (Semana 7)
- Product Hunt
- Comunidades de calistenia en Reddit
- Influencers micro (5k-50k followers)

---

## 🔮 **Futuras Features** (Post-MVP)

### **v1.1 - Social Light**
- Compartir rutinas
- Códigos QR para rutinas
- Estadísticas semanales

### **v1.2 - Inteligencia**
- Sugerencias basadas en historial
- Auto-ajuste de tiempos
- Detección de fatiga

### **v1.3 - Comunidad**
- Retos semanales
- Tablas de liderazgo opcionales
- Rutinas de la comunidad

### **v2.0 - Ecosistema**
- Apple Watch / WearOS
- Sincronización multi-dispositivo
- Integración con Spotify
- Exportar a Apple Health / Google Fit

---

## 💬 **Copy para App Store**

### **Título**
FlowFit - Timer Inteligente para Entrenar

### **Descripción corta**
Crea rutinas, controla tiempos, entrena a tu ritmo. Simple y efectivo.

### **Keywords**
calistenia, timer, HIIT, entrenamiento, casa, parque, cronómetro, rutinas, ejercicio

### **Descripción larga**
```
¿Cansado de apps de ejercicio sobrecargadas? FlowFit es diferente.

Diseñada para quienes entrenan de verdad - en casa, en el parque, 
donde sea. Sin distracciones, sin suscripciones, sin complicaciones.

✓ Crea rutinas personalizadas en segundos
✓ Arrastra y suelta ejercicios 
✓ Timer inteligente con alertas sonoras
✓ Perfecto para calistenia, HIIT, yoga, stretching
✓ Historial de entrenamientos
✓ 100% offline, 100% tuyo

Tu tiempo, tu tempo, tu entrenamiento.
```

---

## 🎯 **Siguiente Paso Inmediato**

1. **Validar el concepto**: Crear un prototipo en Figma (2 días)
2. **Setup técnico**: Inicializar Expo y estructura base (1 día)
3. **Timer MVP**: Implementar Sprint 1 completo (5 días)
4. **Test con usuarios**: 10 personas de la comunidad de calistenia

**Tiempo total hasta MVP funcional**: 8 días

**Tiempo hasta versión 1.0 completa**: 8-10 semanas