u# Plan de implementación — SetFit (Ago 2025)

> Basado en la guía de branding actual y en prácticas recomendadas de Expo/React Native esperadas para agosto 2025.

## 1. Objetivo del MVP

- Crear y gestionar rutinas de entrenamiento por bloques (ejercicio/descanso) con series.
- Ejecutar rutinas con temporizador continuo, avisos sonoros/hápticos y anticipación del siguiente bloque.
- Mantener un historial de rutinas ejecutadas con metadatos básicos (duración, fecha, completado o abortado).
- Diseñar la interfaz conforme al brand book (paleta SetFit, tipografías Inter + Red Hat Mono, enfoque dark-mode-first) y tono de voz empático.

## 2. Pila tecnológica

- **Expo SDK ≥ 52** (previsto Q2 2025) con soporte React Native 0.76 y `expo-router` 3.x (file-based routing, layouts anidados, SSR opcional si lanzamos web más adelante).
- **TypeScript** estricto (`"strict": true`, `tsconfig.json` afinado para React Native/Expo Router).
- **State manager:** Zustand 5.x con middlewares (`persist`, `immer`) para stores ligeros y sincronización con SQLite. Mantiene simplicidad y rendimiento frente a alternativas más pesadas.
- **Persitencia:** `expo-sqlite/next` (API asincrónica basada en Promises, integrada a Hermes) para rutinas, bloques y sesiones históricas. Ofrece migraciones y consultas tipadas. Fallback en web a `expo-sqlite/legacy` o IndexedDB cuando habilitemos PWA.
- **Drag & drop:** `react-native-draggable-flatlist` 4.x (compat Reanimated 3) sobre `GestureHandler`. Suficiente para bloques verticales, sin necesidad de construir DnD desde cero.
- **Timers y precisión:** Hook propio con `expo-keep-awake` + `BackgroundTimer` (nativo) para confiabilidad cuando la app va a background. Implementamos fallback a `setInterval` + `Date.now` diff.
- **Audio/Háptica:** `expo-av` para reproducción sample-accurate de wavs empaquetados y `expo-haptics` para feedback háptico. Sonidos precargados en `/assets/sfx` para evitar latencia.
- **Animaciones:** `react-native-reanimated` 3.x. Timer ring y pulsos se implementan con `Animated` declarativo + `react-native-svg` para el anillo.
- **UI toolkit:** Diseño propio con tokens en `theme/tokens.ts`. Se puede apoyar en `@shopify/restyle` para tipado de estilos reutilizables, manteniendo control sobre la marca.
- **Testing:**
  - Unit/component: `@testing-library/react-native` + `vitest` (o Jest 30 cuando se estabilice en 2025; en Expo 52 vitest ya tiene soporte oficial).
  - E2E: `maestro` CLI (sin dependencias nativas) para flujos críticos (crear rutina, ejecutar, registrar historial).
- **Internacionalización:** `expo-localization` + `i18next` para español/inglés; microcopy del brand guide como default.
- **Tooling Dev:** ESLint 9 + `@react-native-community/eslint-config`, Prettier 3, Husky + lint-staged para ganchos opcionales.

## 3. Arquitectura de carpetas (Expo Router)

```
app/
  _layout.tsx            # Layout base con providers de tema, estado y safe area
  index.tsx              # Home — lista de rutinas, CTA crear, última rutina
  routines/
    _layout.tsx
    new.tsx              # Editor crear rutina
    [id].tsx             # Editor editar rutina
  play/
    [id].tsx             # pantalla de ejecución con timer ring
  history/
    index.tsx            # historial y detalle básico
components/
  blocks/                # BlockChip, GroupCapsule, drag handle, etc.
  timers/
    TimerRing.tsx
    CountDownBeep.tsx
  layout/
    Screen.tsx, Header, BottomControls
hooks/
  useIntervalEngine.ts   # core del motor de temporizador con audio/haptics
  useRoutineBuilder.ts   # lógica de edición + persistencia temporal
stores/
  routines.store.ts
  sessions.store.ts
services/
  audio.ts               # preload y manejo de sonidos (expo-av)
  persistence/
    db.ts                # inicialización SQLite + migraciones versión 1
    repositories/        # DAO para rutinas/sesiones/bloques
theme/
  tokens.ts
  palette.ts
  typography.ts
  ThemeProvider.tsx
assets/
  fonts/
  sfx/
```

> `expo-router` permite nested layouts y transiciones nativas. Usamos `gestureEnabled` y `presentation` para modal cuando editemos bloques dentro de series (futuro).

## 4. Modelo de datos v1

- **Routine** `{ id, name, createdAt, updatedAt, note?, totalDuration, version }`
- **Block** `{ id, routineId, type: 'exercise' | 'rest', name, durationSec, order, groupId? }`
- **Group** `{ id, routineId, label, repetitions }` → opcional; en MVP usamos `groupId` para series; UI agrupa bloques contiguos bajo la misma serie.
- **Session** `{ id, routineId, startedAt, completedAt?, status: 'completed' | 'skipped' | 'aborted', totalElapsedSec }`
- **SessionBlockLog** `{ id, sessionId, blockId, startedAt, endedAt, status }` (para historial detallado; se puede posponer y solo guardar resumen).

Persistimos rutinas/bloques con `FOREIGN KEY`s. Para historial rápido usamos `views` o queries agregadas.

## 5. Flujos principales

1. **Home**
   - Lista de rutinas (ordenado por uso reciente).
   - CTA `Nueva rutina`, `Última rutina` (quick start), acceso a historial.
2. **Editor**
   - Panel superior: nombre + total.
   - Lista de bloques (`DraggableFlatList`).
   - Toolbelt inferior: `Añadir ejercicio`, `Añadir descanso` (modales para nombre y duración).
   - Selección múltiple -> acción `Convertir en serie (xN)` (actualiza `groupId` y repeticiones).
   - Ajustes inline (tap tiempo => sheet con slider + entrada numérica).
3. **Ejecución**
   - Pantalla full-screen con Timer Ring, nombre bloque, `Now/Next` y controles (Play/Pause, Skip, Reset).
   - Al reproducir: dispara `useIntervalEngine` que gestiona countdown, audio y transiciones `exercise <-> rest`.
   - Ultimos 3s: animación `Rest Teal → Warning Amber`, beep prolongado + haptic `success`.
4. **Historial**
   - Lista cronológica con cards (fecha, rutina, duración, porcentaje completado).
   - Detalle simple (modal): ver bloques completados y tiempo real.

## 6. Tema & UI System

- Implementar `ThemeProvider` con tokens del brand guide.
- Soporte light/dark desde el inicio (`useColorScheme()` + toggles manual).
- Componentes clave: `BlockChip`, `SeriesBadge`, `TimerRing`, `BottomControls`. Todos usan tokens y tipografías declaradas (Inter/Red Hat Mono).
- Accesibilidad: fuentes escalables (`allowFontScaling`), contraste 4.5:1, tamaños táctiles ≥ 48 px.

## 7. Audio & Háptica

- Precargar sonidos en `useEffect` global (App entry) con `Audio.Sound.createAsync`.
- Abstraer en `audio.ts` funciones `playCountdown()`, `playExerciseEnd()`, etc., con control de volumen.
- Haptics: `Haptics.notificationAsync` / `selectionAsync` según estado.
- Permitir modo silencioso (toggle en ejecución) que mutea audio y deja haptics/visual.

## 8. Calidad y métricas

- **Tests unitarios** para hooks (`useIntervalEngine`, `useRoutineBuilder`).
- **Snapshots** de componentes (Timer, BlockChip) para regresión visual básica.
- **Maestro flows**: create → execute → finish, y abort mid-run.
- Integrar `expo-doctor --fix` en CI para mantener SDK limpio.

## 9. Distribución

- Expo Application Services (EAS) Build/Submit para iOS/Android.
- Configurar `app.config.ts` con iconos, splash (en línea con branding), permisos (audio/haptics).
- OTA via EAS Update canal `preview` (QA) y `production`.

## 10. Riesgos y mitigaciones

- **Precisión de timer en background:** validar en dispositivos reales; usar `TaskManager` + `BackgroundFetch` si usuarios quieren recordatorios (backlog).
- **Performance del drag en listas largas:** monitorear 60fps; usar `FlashList` si la cantidad de bloques crece.
- **Sincronización audio/haptics:** pre-cargar y evitar reproducir múltiples sonidos en paralelo.
- **Persistencia multiplataforma (web):** posponer until PWA; planear abstracción en repository layer.

## 11. Próximos pasos

1. Inicializar proyecto Expo + configurar tooling (TypeScript, ESLint, rutas).
2. Implementar ThemeProvider y tokens.
3. Construir Home + store de rutinas (mock en memoria) → luego conectar SQLite.
4. Editor con bloques drag & drop (flux iterativo).
5. Pantalla Play con motor de timer.
6. Historial + persistencia real.
7. Integrar audio/haptics y tests.

> *Nota de investigación:* El entorno actual está sin acceso a internet, así que esta planificación se basa en el estado del ecosistema Expo hasta 2024 y en la roadmap pública de Expo/EAS. Antes de agosto 2025 conviene reconfirmar versiones exactas (SDK 52/53) y compatibilidades.

    npm config set legacy-peer-deps true
    NODE_ENV=production npx eas build --profile preview --platform android --local
npx expo export --platform android