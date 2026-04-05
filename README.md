# FretFlow

Interactive guitar scale visualizer built with Next.js 16 and React 19. Explore scales, notes, and intervals across a dynamic fretboard with real-time visualization.

## Features

- **Interactive Fretboard** - Dynamic visualization of guitar fretboard with customizable settings
- **Scale Exploration** - Built-in scales including Major, Minor, Pentatonic, Blues, Dorian, Phrygian, Lydian, Mixolydian, and Harmonic Minor
- **Color-Coded Intervals** - Visual representation of scale intervals with root notes highlighted
- **Multiple Tunings** - Support for various guitar tunings
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Dark Mode** - Built-in theme switching for comfortable viewing in any lighting

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + Turbopack (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 + shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Utilities | clsx, tailwind-merge, class-variance-authority |
| Icons | lucide-react |
| Theme | next-themes |

## Getting Started

### Prerequisites

- Node.js 18+ 
- bun (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fret-flow.git
cd fret-flow

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
# Create a production build
bun build

# Start the production server
bun start
```

## Available Commands

```bash
bun dev        # Start development server with Turbopack
bun build      # Build for production
bun typecheck  # Run TypeScript type checking
bun lint       # Run ESLint
bun format     # Format code with Prettier
bun add <pkg>  # Install a new dependency
```

## Project Structure

```
fret-flow/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Main fretboard explorer page
│   └── globals.css         # Tailwind CSS + custom CSS variables
├── components/
│   ├── fretboard/
│   │   ├── Fretboard.tsx      # Grid orchestrator for the fretboard
│   │   ├── StringRow.tsx      # Single string row component
│   │   ├── NoteCell.tsx       # Individual fret cell (performance critical)
│   │   ├── FretMarkers.tsx    # Fret inlay dots (3, 5, 7, 9, 12, 15)
│   │   └── hooks/
│   │       └── useFretboard.ts  # Fretboard grid + active notes logic
│   ├── controls/
│   │   ├── RootSelector.tsx    # Root note selector
│   │   ├── ScaleSelector.tsx   # Scale type selector
│   │   ├── TuningSelector.tsx  # Guitar tuning selector
│   │   └── hooks/
│   │       └── useControls.ts   # Control state management
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── notes.ts               # Chromatic scale, enharmonic mappings
│   ├── scales.ts              # Scale formulas + interval arrays
│   ├── fretboard.ts           # Note-at-fret calculations
│   ├── tunings.ts             # Guitar tuning presets
│   ├── colors.ts              # Interval → CSS variable mappings
│   └── utils.ts               # Utility functions (cn, etc.)
├── hooks/                     # Reusable hooks only
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
└── types/
    └── music.ts               # TypeScript types (NoteName, IntervalName, etc.)
```

## Music Theory Implementation

### Core Calculations

The application uses precise music theory calculations defined in `lib/`:

```typescript
// Chromatic scale (12 semitones)
export const CHROMATIC: NoteName[] =
  ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

// Note at fret calculation
export const getNoteAtFret = (open: NoteName, fret: number): NoteName =>
  CHROMATIC[(CHROMATIC.indexOf(open) + fret) % 12]

// Scale note generation
export const getScaleNotes = (root: NoteName, formula: number[]): NoteName[] => {
  let i = CHROMATIC.indexOf(root)
  return [root, ...formula.slice(0, -1).map(step => CHROMATIC[i = (i + step) % 12])]
}
```

### Available Scales

- Major
- Natural Minor
- Major Pentatonic
- Minor Pentatonic
- Blues
- Dorian
- Phrygian
- Lydian
- Mixolydian
- Harmonic Minor

### Default Settings

- **Tuning**: E Standard (low to high: E-A-D-G-B-E)
- **Fret Range**: 0–15
- **Fret Inlays**: 3, 5, 7, 9, 12 (double), 15

## Adding New Scales

To add a new scale, simply append it to the `SCALES` array in `lib/scales.ts`:

```typescript
export const SCALES = [
  // ... existing scales
  {
    id: 'your_scale_id',
    name: 'Your Scale Name',
    formula: [2, 2, 1, 2, 2, 2, 1], // Semitone steps
    intervals: ['R', '2', '3', '4', '5', '6', '7'] // Interval names
  },
]
```

The scale will automatically appear in the `<ScaleSelector>` component.

## Design Principles

- **Pure Business Logic**: All music theory calculations in `lib/` are pure TypeScript functions with no React dependencies
- **Performance Optimization**: `NoteCell` uses `React.memo` and avoids inline object/array creation
- **CSS Variables**: All interval colors use CSS variables for consistent theming
- **Accessibility**: Every note cell includes descriptive `aria-label` attributes
- **shadcn/ui First**: Check for existing shadcn components before building custom ones

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (conventional commits preferred)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [lucide-react](https://lucide.dev/)
- Tailwind CSS for styling
