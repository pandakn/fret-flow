# CLAUDE.md — FretFlow

> Interactive guitar scale visualizer. This file tells Claude how to think, build, and extend FretFlow correctly.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 + Turbopack (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Utilities | clsx, tailwind-merge, class-variance-authority |
| Icons | lucide-react |
| Theme | next-themes |

No state management library — use React `useState`/`useContext`. No audio library yet. No test runner yet.

---

## Repository Structure

```
fret-flow/
├── app/
│   ├── layout.tsx          ← root layout, ThemeProvider
│   ├── page.tsx            ← main fretboard explorer
│   └── globals.css         ← Tailwind + CSS tokens
├── components/
│   ├── fretboard/
│   │   ├── Fretboard.tsx      ← grid orchestrator
│   │   ├── StringRow.tsx      ← one string
│   │   ├── NoteCell.tsx       ← single fret cell (hot path)
│   │   ├── FretMarkers.tsx    ← inlay dots
│   │   └── hooks/
│   │       └── useFretboard.ts  ← fretboard grid + active notes
│   ├── controls/
│   │   ├── RootSelector.tsx
│   │   ├── ScaleSelector.tsx
│   │   ├── TuningSelector.tsx
│   │   └── hooks/
│   │       └── useControls.ts   ← root/scale/tuning selection state
│   └── ui/                    ← shadcn generated components
├── lib/
│   ├── notes.ts               ← chromatic scale, enharmonics
│   ├── scales.ts              ← scale formulas + interval arrays
│   ├── fretboard.ts           ← note-at-fret calculations
│   ├── tunings.ts             ← tuning presets
│   └── colors.ts              ← interval → CSS variable map
├── hooks/                     ← reusable hooks only (no feature logic)
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
└── types/
    └── music.ts               ← NoteName, IntervalName, FretNote, etc.
```

---

## Core Music Theory Rules

**Never deviate from these calculations.**

```ts
// lib/notes.ts
export const CHROMATIC: NoteName[] =
  ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

export const getNoteAtFret = (open: NoteName, fret: number): NoteName =>
  CHROMATIC[(CHROMATIC.indexOf(open) + fret) % 12]

// lib/scales.ts
export const getScaleNotes = (root: NoteName, formula: number[]): NoteName[] => {
  let i = CHROMATIC.indexOf(root)
  return [root, ...formula.slice(0, -1).map(step => CHROMATIC[i = (i + step) % 12])]
}
```

- Default tuning (low→high): `['E','A','D','G','B','E']`
- Default fret range: `0–15`
- Fret inlays at: 3, 5, 7, 9, 12 (double), 15
- Enharmonic rule: sharp keys use sharps, flat keys use flats

---

## Key Types

```ts
// types/music.ts
type NoteName = 'C'|'C#'|'D'|'D#'|'E'|'F'|'F#'|'G'|'G#'|'A'|'A#'|'B'
type IntervalName = 'R'|'b2'|'2'|'b3'|'3'|'4'|'b5'|'#4'|'5'|'b6'|'#5'|'6'|'b7'|'7'

type FretNote = {
  string: number
  fret: number
  note: NoteName
  interval: IntervalName | null
  isRoot: boolean
  isActive: boolean
}
```

---

## Interval Color System

```ts
// lib/colors.ts — always use CSS vars, never hardcode hex in components
export const INTERVAL_COLORS: Record<string, string> = {
  'R':  'var(--color-root)',   // amber gold — visually dominant
  '2':  'var(--color-2)',
  'b3': 'var(--color-b3)',  '3': 'var(--color-3)',
  '4':  'var(--color-4)',
  'b5': 'var(--color-b5)', '#4': 'var(--color-b5)',
  '5':  'var(--color-5)',
  'b6': 'var(--color-b6)', '#5': 'var(--color-b6)',
  '6':  'var(--color-6)',
  'b7': 'var(--color-b7)',  '7': 'var(--color-7)',
}
```

CSS tokens in `app/globals.css`:
```css
:root {
  --color-root: #d4952a;
  --color-2: #4a9eca;   --color-b3: #7b68ee;  --color-3: #5bc4a0;
  --color-4: #e8855a;   --color-b5: #e05c7a;  --color-5: #6ab04c;
  --color-b6: #c0a86e;  --color-6: #48bfa8;   --color-b7: #9b59b6;
  --color-7: #e8c23a;
}
```

---

## Built-in Scales

```ts
// lib/scales.ts
export const SCALES = [
  { id: 'major',            name: 'Major',            formula: [2,2,1,2,2,2,1], intervals: ['R','2','3','4','5','6','7'] },
  { id: 'natural_minor',    name: 'Natural Minor',    formula: [2,1,2,2,1,2,2], intervals: ['R','2','b3','4','5','b6','b7'] },
  { id: 'pentatonic_major', name: 'Major Pentatonic', formula: [2,2,3,2,3],     intervals: ['R','2','3','5','6'] },
  { id: 'pentatonic_minor', name: 'Minor Pentatonic', formula: [3,2,2,3,2],     intervals: ['R','b3','4','5','b7'] },
  { id: 'blues',            name: 'Blues',            formula: [3,2,1,1,3,2],   intervals: ['R','b3','4','b5','5','b7'] },
  { id: 'dorian',           name: 'Dorian',           formula: [2,1,2,2,2,1,2], intervals: ['R','2','b3','4','5','6','b7'] },
  { id: 'phrygian',         name: 'Phrygian',         formula: [1,2,2,2,1,2,2], intervals: ['R','b2','b3','4','5','b6','b7'] },
  { id: 'lydian',           name: 'Lydian',           formula: [2,2,2,1,2,2,1], intervals: ['R','2','3','#4','5','6','7'] },
  { id: 'mixolydian',       name: 'Mixolydian',       formula: [2,2,1,2,2,1,2], intervals: ['R','2','3','4','5','6','b7'] },
  { id: 'harmonic_minor',   name: 'Harmonic Minor',   formula: [2,1,2,2,1,3,1], intervals: ['R','2','b3','4','5','b6','7'] },
]
```

To add a scale: append to `SCALES` — it auto-appears in `<ScaleSelector>`.

---

## Critical Rules

1. **`lib/` is pure TypeScript** — zero React, zero imports from `components/`. All logic must be plain functions.
2. **NoteCell is a hot path** — 6×16 = 96 renders per interaction. Use `React.memo`, no inline object/array creation.
3. **Interval colors via CSS vars only** — import `INTERVAL_COLORS`, never write hex in JSX.
4. **Root note always visually dominant** — larger, brighter, or distinct shape vs other active notes.
5. **Accessibility** — every NoteCell needs `aria-label="G, fifth, fret 3 string 2"`.
6. **shadcn for all generic UI** — buttons, selects, sliders, tooltips, badges come from `components/ui/`. Don't reinvent them.

---

## Commands

```bash
bun dev        # Next.js + Turbopack dev server
bun build      # production build
bun typecheck  # tsc --noEmit
bun lint       # eslint
bun format     # prettier
bun add <pkg>  # install a package
```