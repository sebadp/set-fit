# SetFit — Brand & UX Guide (v1)

> *“Arrastrá bloques. Dale play. Entrená con ritmo.”*

---

## 0) Resumen ejecutivo

* **Nombre recomendado:** **SetFit**
* **Tagline:** *Bloques. Ritmo. Resultado.*
* **Idea fuerza:** La manera más simple de crear rutinas por bloques (ejercicio/descanso), ejecutarlas con avisos sonoros claros y mantener un historial sin fricción.
* **Personalidad:** Minimal coach · Claro · Enfocado · Empático · Energía tranquila (no grita, guía).

Alternativas de nombre (si necesitás plan B): **Ritmika**, **SetBeat**, **TempoSet**, **BloqFit**, **Cadencia**.

---

## 1) Posicionamiento & Voz de marca

**Propuesta de valor:** El timer por intervalos que no estorba: armás bloques con el dedo, le das play, te guía con sonido y color. Sin mil features — solo lo esencial, bien hecho.

**Voz & tono:**

* **Claro** (sin tecnicismos innecesarios): “Listo para tu próxima serie”.
* **Motivación serena:** “Buen ritmo. Tomate aire y seguí.”
* **Conciso y humano:** frases cortas, sin exclamaciones excesivas.
* **Local-first, global-ready:** español neutro con opciones para inglés.

**Pilares de marca:**

1. **Simplicidad funcional** (menos taps, más entrenamiento)
2. **Ritmo y feedback** (audio, color, haptic)
3. **Confiabilidad** (timing preciso, accesibilidad)

---

## 2) Identidad visual

### 2.1 Logo system

* **Logotipo:** *SetFlow* con mayúscula inicial; kerning óptico; tracking levemente positivo (+1–2%).
* **Isotipo (app icon / marca corta):** Bloques apilados (ejercicio/descanso) formando una **S** sutil con un **triángulo de play** negativo en el centro. Silueta fuerte, legible a 24px.
* **Construcción:** grid 24×24, monoline 2 px (en artboard 512 px).
* **Clearspace:** ≥ 0.5× del alto del símbolo alrededor.
* **Tamaños mínimos:**

  * Impreso: ≥ 15 mm (solo símbolo), 22 mm (lockup completo).
  * Pantalla: ≥ 24 px (símbolo), 96 px (lockup).
* **Usos correctos:** color, mono oscuro/claro, sobre fondos sólidos.
* **Usos incorrectos:** sin gradientes, sin sombras duras, sin contornos extra, no deformar, no rotar.

> **Dirección visual del símbolo:** Rectángulos con esquinas de 8/12 dp simbolizan los **bloques**; el hueco central sugiere **play**; la diagonal insinúa **flujo**.

### 2.2 Paleta cromática

**Core**

* **SetFlow Green** `#10B981` (primario — éxito/actividad)
* **Rest Teal** `#14B8A6` (descanso/recuperación)
* **Focus Indigo** `#6366F1` (enfoque/acciones primarias alternativas)
* **Warning Amber** `#F59E0B` (pre‑aviso últimos segundos)
* **Alert Red** `#EF4444` (detener/errores)

**Neutrales**

* **Ink** `#111827`
* **Slate** `#6B7280`
* **Cloud** `#E5E7EB`
* **Paper** `#FFFFFF`
* **Charcoal (Dark BG)** `#0B1220`

**Accesibilidad:** Asegurar contraste ≥ 4.5:1 para texto. Variantes **SetFlow Green 700** (`#059669`) y **Indigo 700** (`#4F46E5`) para textos sobre claro.

### 2.3 Tipografía

* **UI & copy:** **Inter** (Google) — pesos 400/600/700. Activa `font-variant-numeric: tabular-nums;` para contadores.
* **Numeral destacada (opcional para timer grande):** **Red Hat Mono** 500 — uso en pantalla de ejecución.

### 2.4 Iconografía

* Estilo **outline** 2 px, esquinas suaves, grid 24×24.
* Íconos clave: Play/Pause/Reset, Block, Group/Series, Bell, History, Plus, DragHandle.

### 2.5 Ilustración & fotografía

* Evitar stock fitness agresivo. Preferir siluetas simples, posturas neutras, diversidad corporal.
* Ilustraciones con rellenos planos y trazos de 2 px.

### 2.6 Motion & micro‑interacciones (identidad de movimiento)

* **Física suave** (easing out‑quint).
* **Transiciones:** 180–240 ms en navegación; 90–120 ms en estados (hover/press).
* **Pulsos últimos 3s:** parpadeo del anillo de progreso de **Rest Teal → Amber**.

### 2.7 Sonido & háptica (audio branding)

* **Countdown (3‑2‑1):** bip corto 100 ms a 1 kHz, –6 dBFS; último segundo **Amber** + bip 300 ms a 1 kHz, –3 dBFS + haptic *success*.
* **Fin de ejercicio:** tono 400 ms a 880 Hz (A4), 0 dBFS + haptic *impact*.
* **Inicio de descanso:** bip 200 ms a 600 Hz, –6 dBFS + haptic *soft*.
* **Fin de descanso:** idem countdown corto.
* **Pack “silencioso”:** solo háptica + flash visual (accesibilidad).

---

## 3) Diseño UX — Estructura & patrones

> **Regla de oro:** “Siempre sabés qué está pasando, cuánto falta y qué viene después.”

### 3.1 Arquitectura de información

1. **Inicio** — Rutinás (lista), CTA “Nueva rutina”, acceso rápido a “Última usada”.
2. **Editor** — Constructor por bloques (drag & drop), agrupación en series, ajustes de tiempos, nombre.
3. **Ejecutar** — Pantalla de timer a pantalla completa, controles grandes, siguiente bloque anticipado.
4. **Historial** — Lista cronológica con badges (completada, parcial), duración total y resumen.

### 3.2 Componentes clave

* **Block Chip**: pastilla con color de estado (Ejercicio=Green, Descanso=Teal), tiempo y handle de arrastre.
* **Group Capsule**: contenedor con etiqueta “x3 series” + colapso/expandir.
* **Timer Ring**: anillo progresivo con relleno radial; el centro muestra **mm:ss** grande + nombre del bloque.
* **Now/Next**: línea secundaria “Siguiente: Flexiones — 00:30”.
* **Bottom Controls**: Play/Pause, Skip, Reset (altura accesible para pulgar).

### 3.3 Patrones de color por estado

* **Ejercicio activo:** fondo oscuro + anillo **SetFlow Green**.
* **Últimos 3 s:** parpadeo **Amber** + beep.
* **Descanso:** anillo **Rest Teal** con respiración suave (1.8 s).
* **Pausa:** desaturar y congelar progresos; botón “Reanudar”.

### 3.4 Accesibilidad

* Tamaño de toque ≥ 44×44 dp.
* Modo alto contraste.
* Alternativa sin audio (háptica + visual).
* VoiceOver/TalkBack: anuncia “Quedan 10 segundos de descanso; siguiente: Sentadillas”.

---

## 4) Texto de ejemplo (microcopy)

* **Inicio vacío:** “Creá tu primera rutina en menos de un minuto.”
* **Editor:** “Arrastrá bloques de ejercicio y descanso. Seleccioná y convertí en series.”
* **Ejecutar:** “Listo… 3, 2, 1… ¡vamos!” (sin exclamaciones múltiples)
* **Historial:** “Buen ritmo. 12 min hoy · 4 bloques completados.”

---

## 5) Guía de componentes UI (tokens)

**Espaciado:** 4 / 8 / 12 / 16 / 24 / 32

**Radios:** 12 / 16 / 24 (tarjetas, chips, controles principales)

**Sombra (elevación):**

* Card: 0 4 12 rgba(0,0,0,0.08)
* Modal: 0 8 24 rgba(0,0,0,0.16)

**Estados de botón primario (Green):**

* Default `#10B981`
* Hover `#0FB37A`
* Active `#0A8F64`
* Disabled `#86E7C6` (texto `#163D31` 40% op.)

**Tipografía UI:**

* H1 32/40 · Inter 700
* H2 24/32 · Inter 600
* Body 16/24 · Inter 400
* Caption 12/16 · Inter 400
* **Timer** 72/72 · Red Hat Mono 500, tabular

---

## 6) App Icon & Safe Area

* **Forma:** rounded‑square (Android Adaptive + iOS), margen interno 12%.
* **Composición:** símbolo de bloques con play negativo, sobre **SetFlow Green** o **Charcoal**.
* **No texto** dentro del ícono. Contraste fuerte.

---

## 7) Entregables / Assets (v1)

**/brand**

* logo_setflow_full.svg / .pdf / .png
* logo_setflow_symbol.svg / .png (mono y color)
* palette_tokens.json (nombres + hex)
* typography.css (Inter + Red Hat Mono, tabular nums)

**/app_icons**

* Android Adaptive: 432×432, 324×324 safe / iOS: 1024×1024 master

**/sound_pack**

* sf_count_short.wav (100 ms, 1 kHz)
* sf_count_long.wav (300 ms, 1 kHz)
* sf_exercise_end.wav (400 ms, 880 Hz)
* sf_rest_start.wav (200 ms, 600 Hz)

**/store**

* screenshots templates 1080×1920 (light/dark)
* feature graphic 1024×500 (Play Store)

---

## 8) Prompts para generación (logo, ícono, screenshots)

**Logo (símbolo + lockup)**
“Flat, clean **vector logo** for **SetFlow**. Icon: stacked rounded rectangles (exercise/rest blocks) forming a subtle **S** with a **negative-space play triangle**. Geometry‑first, monoline **2 px** at **512 px** artboard, **24×24 grid**, **8–12 dp corner radius**. No gradients/shadows/3D. Palette: SetFlow Green `#10B981`, Rest Teal `#14B8A6`, Indigo `#6366F1`, Ink `#111827`, Paper `#FFFFFF`. Strong silhouette, high legibility at **24 px**. Provide **icon‑only** and **lockup** with wordmark (Inter‑inspired).”

**App icon**
“Minimal **app icon**: rounded square, safe‑margin 12%, icon of stacked rounded blocks forming an **S** with **negative-space play**. Background **SetFlow Green `#10B981`** or **Charcoal `#0B1220`**. No text, no gradient, high contrast.”

**Screenshots (store)**
“Mobile app screenshots (1080×1920). Screen 1: ‘Creador por bloques’ showing drag‑and‑drop chips (Green/Teal). Screen 2: ‘Timer en ejecución’ with big **mm:ss**, anillo progresivo, Now/Next line, color state (Green/Teal) and last‑seconds Amber pulse. Screen 3: ‘Historial simple’ with sessions list and completed badges. Flat UI, Inter font, SetFlow palette, no shadows, clean craft aesthetic.”

---

## 9) Principios de QA visual (para mantener coherencia)

1. **Una sola jerarquía dominante por pantalla** (el resto apoya).
2. **Color con significado** (no decorativo): Green=acción, Teal=descanso, Amber=preaviso.
3. **Texto en 2 líneas máximo** para estados en ejecución.
4. **Botones grandes y espaciados** (pulgar feliz > diseño bonito).
5. **Dark mode first** (contraste y ahorro de energía en OLED).

---

## 10) Roadmap de branding (próximas iteraciones)

* Pack de iconos propios (outline 2 px)
* Ilustraciones onboarding (3 tomas)
* Guía de sonido ampliada (volumen relativo, packs alternativos)
* Animaciones Lottie (anillo y pulsos)
* Página simple de marketing (1 hero + 3 bloques + FAQ)

---

### Nota final

**SetFlow** vive entre dos ideas: **orden** (bloques) y **impulso** (play). Si una decisión no mejora alguna de esas dos, probablemente sobra.
