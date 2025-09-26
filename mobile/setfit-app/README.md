# SetFit — Mobile app (Expo)

Proyecto Expo Router para el MVP de SetFit. Incluye estructura alineada al brand book, tipografías oficiales, motor de temporizador con audio/háptica, editor drag & drop y persistencia en SQLite para rutinas e historial.

## Scripts

- `npm start` — lanza el bundler.
- `npm run android` / `npm run ios` / `npm run web` — abre la app en cada plataforma.

## Estructura

```
app/
  _layout.tsx         # Layout raíz con SafeArea + ThemeProvider + fuentes cargadas
  (tabs)/             # Navegación tab inferior (Inicio, Rutinas, Historial)
    _layout.tsx
    index.tsx         # Home con CTA + quick start de rutinas
    routines/index.tsx
    history/index.tsx # Historial persistido de sesiones
  routines/
    new.tsx           # Editor drag & drop para crear rutina
    [id].tsx          # Edición modal
  play/[id].tsx       # Pantalla de ejecución con anillo animado y controles
src/
  components/
    layout/           # Contenedores y helpers de layout
    builder/          # Editor drag & drop de bloques/series
    timers/           # TimerRing animado
  data/mockRoutines.ts
  hooks/              # Hooks (interval engine, routine builder)
  services/
    audio.ts          # Gestión de sonidos (expo-av)
    haptics.ts        # Feedback háptico (expo-haptics)
    persistence/      # SQLite (rutinas + sesiones)
  stores/routineStore.ts
  theme/              # Paleta, tokens y tipografía (Inter + Red Hat Mono)
  utils/
    id.ts             # Generador de IDs únicos
assets/
  sfx/                # Beeps cortos para countdown/transición
```

## Próximos pasos

1. Añadir motor de temporizador en background (keep-awake, notificaciones) y validarlo en dispositivos reales.
2. Integrar editor con persistencia de bloques/series (edición avanzada, duplicado, plantillas).
3. Cubrir core hooks/components con pruebas (Vitest + React Native Testing Library) y reforzar accesibilidad (VoiceOver, modo silencioso extendido).

## Build local APK

1. Asegurate de tener instalado Java 17, Android SDK (con build-tools 33+) y Docker (opcional).
2. Inicia sesión en Expo (`npx expo login`) o exportá `EXPO_TOKEN` con tu access token.
3. Ejecutá `npx eas login` si usás token.
4. Corre `npx eas build --profile preview --platform android --local`. El APK se generará en `./dist/`.

> Nota: En entornos sin acceso a `api.expo.dev` el comando no avanzará; habilitá la red o corré el build en una máquina con conexión.
