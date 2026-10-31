/**
 * NOCTIS Scrollytelling Configuration
 * Tunable settings for section heights, frame counts, frame paths, chapters, and callout coordinates.
 */
const CONFIG = {
  hero: {
    height: '600vh',
    frameCount: 750,
    desktopPath: 'assets/frames/hero/frame_%s.webp',
    mobilePath: 'assets/frames/hero-mobile/frame_%s.webp',
    padLength: 4,
    preloadInitialCount: 40,
    speedMax: 118, // KM/H
    distanceMax: 4.2, // KM
    chapters: [
      { start: 0.00, end: 0.14, id: 'hero-ch1' },
      { start: 0.22, end: 0.40, id: 'hero-ch2' },
      { start: 0.50, end: 0.68, id: 'hero-ch3' },
      { start: 0.80, end: 1.00, id: 'hero-ch4' }
    ],
    fadeToBlackStart: 0.95
  },
  statement: {
    text: "Every part was designed to disappear into one line of light."
  },
  dismantle: {
    height: '350vh',
    frameCount: 250,
    desktopPath: 'assets/frames/dismantle/frame_%s.webp',
    mobilePath: 'assets/frames/dismantle-mobile/frame_%s.webp',
    padLength: 4,
    calloutsStartProgress: 0.70,
    callouts: [
      {
        id: 'body',
        label: 'BODY',
        text: 'Carbon composite monocoque',
        dot: { x: 42, y: 22 },
        lineDx: -50,
        lineDy: -40,
        textPos: { x: 22, y: 14 },
        triggerProgress: 0.72
      },
      {
        id: 'light',
        label: 'LIGHT',
        text: 'Single-line LED signature',
        dot: { x: 80, y: 55 },
        lineDx: 60,
        lineDy: -35,
        textPos: { x: 74, y: 44 },
        triggerProgress: 0.78
      },
      {
        id: 'battery',
        label: 'BATTERY',
        text: '110 kWh structural pack',
        dot: { x: 38, y: 64 },
        lineDx: -50,
        lineDy: 50,
        textPos: { x: 18, y: 76 },
        triggerProgress: 0.84
      },
      {
        id: 'drive',
        label: 'DRIVE',
        text: 'Dual axial-flux motors, 680 kW',
        dot: { x: 65, y: 59 },
        lineDx: 50,
        lineDy: 50,
        textPos: { x: 62, y: 76 },
        triggerProgress: 0.90
      }
    ]
  },
  lineup: {
    models: [
      {
        id: 'gt-e',
        number: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        specs: { range: '640 km', accel: '3.1 s', power: '680 kW' },
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe',
        colors: ['#1A1C20', '#EDEAE4', '#0F1A2C', '#6E0B08']
      },
      {
        id: 's',
        number: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        specs: { range: '600 km', accel: '3.6 s', power: '520 kW' },
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white sport sedan',
        colors: ['#EDEAE4', '#1A1C20', '#1C2B36', '#2D282A']
      },
      {
        id: 'x',
        number: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        specs: { range: '560 km', accel: '4.2 s', power: '480 kW' },
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue coupe SUV',
        colors: ['#0C1628', '#1A1C20', '#3E4249', '#EDEAE4']
      },
      {
        id: 'r',
        number: '04',
        name: 'R',
        tagline: 'Built for the track.',
        specs: { range: '420 km', accel: '2.4 s', power: '900 kW' },
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R track coupe with fixed rear wing',
        colors: ['#0A0B0D', '#E1251B', '#2C2D30', '#EDEAE4']
      },
      {
        id: 'one',
        number: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        specs: { range: 'Concept', accel: '< 2.0 s', power: 'Solid-State' },
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver concept hypercar',
        colors: ['#CFE3FF', '#EDEAE4', '#07080A', '#505663']
      }
    ]
  }
};

