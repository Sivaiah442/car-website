# NOCTIS — The Only Light in the World

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional luxury electric vehicle brand engineered for a city in total blackout at night.

## Visual & Technical Philosophy
- **Quiet, Expensive, Precise**: Vast negative space, minimal text, and high-precision motion.
- **Pure Web Standards**: Built entirely with vanilla HTML5, CSS3, and JavaScript (ES6+). Zero frameworks, zero bundlers, and zero npm runtime dependencies.
- **Scroll-Scrubbed Canvas**: Dual sticky stages render sequence frames onto high-DPI scaled HTML5 `<canvas>` elements with responsive cover and contain projection.
- **Strict Style Guidelines**: Flat solid colors only, 1px hairlines, and typography. Zero gradients, zero glassmorphism, zero drop-shadows, and zero artificial glows.

## Tech Specs & Design Tokens
- **Background**: `--asphalt` (`#07080A`)
- **Accents**: `--xenon` (`#CFE3FF`), `--taillight` (`#E1251B`), `--bone` (`#EDEAE4`)
- **Hairlines**: `rgba(237, 234, 228, 0.12)`
- **Typography**:
  - Display: `Archivo` (Variable Width 125%, Weights 300/400)
  - Body: `Inter` (400)
  - HUD: `JetBrains Mono` (400)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`

## Sections
1. **Hero**: 750-frame continuous sequence scrubbing, left-edge telemetry HUD (velocity and distance tracking), and line-masked sky chapters.
2. **Statement**: Scroll-driven word-by-word reveal (*"Every part was designed to disappear into one line of light."*).
3. **Dismantle**: 250-frame exploded architecture sequence with interactive technical callouts (*Body, Battery, Drive, Light*).
4. **Lineup**: 5-model interactive horizontal accordion with 80ms debounced transitions, color swatches, and keyboard navigation.
5. **Reserve**: Minimal booking call-to-action with thin xenon stroke button and taillight indicator.

## Running Locally
Run with any simple static web server:

```bash
# Using Node:
node serve.js
# Or using VS Code Live Server
```
Visit `http://localhost:3000`.

