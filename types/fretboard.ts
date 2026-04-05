export type ColorPreset = "natural" | "light" | "dark" | "blue" | "purple" | "green" | "red";

export interface FretboardPreset {
  id: ColorPreset;
  name: string;
  description: string;
  preview: string;
}

export const FRETBOARD_PRESETS: FretboardPreset[] = [
  {
    id: "natural",
    name: "Natural Wood",
    description: "Classic wood-tone fretboard",
    preview: "🪵"
  },
  {
    id: "light",
    name: "Light Maple",
    description: "Bright maple wood",
    preview: "🪵"
  },
  {
    id: "dark",
    name: "Dark Rosewood",
    description: "Deep rosewood tone",
    preview: "🪵"
  },
  {
    id: "blue",
    name: "Electric Blue",
    description: "Modern blue aesthetic",
    preview: "🎸"
  },
  {
    id: "purple",
    name: "Cosmic Purple",
    description: "Purple galaxy theme",
    preview: "🌌"
  },
  {
    id: "green",
    name: "Forest Green",
    description: "Natural green tones",
    preview: "🌿"
  },
  {
    id: "red",
    name: "Hot Red",
    description: "Bold red aesthetic",
    preview: "🔥"
  },
];
