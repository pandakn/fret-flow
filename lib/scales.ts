import type { NoteName, IntervalName } from '@/types/music';
import { CHROMATIC } from './notes';

export type Scale = {
  id: string;
  name: string;
  formula: number[];
  intervals: IntervalName[];
};

export const SCALES: Scale[] = [
  { id: 'major', name: 'Major', formula: [2, 2, 1, 2, 2, 2, 1], intervals: ['R', '2', '3', '4', '5', '6', '7'] },
  { id: 'natural_minor', name: 'Natural Minor', formula: [2, 1, 2, 2, 1, 2, 2], intervals: ['R', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'pentatonic_major', name: 'Major Pentatonic', formula: [2, 2, 3, 2, 3], intervals: ['R', '2', '3', '5', '6'] },
  { id: 'pentatonic_minor', name: 'Minor Pentatonic', formula: [3, 2, 2, 3, 2], intervals: ['R', 'b3', '4', '5', 'b7'] },
  { id: 'blues', name: 'Blues', formula: [3, 2, 1, 1, 3, 2], intervals: ['R', 'b3', '4', 'b5', '5', 'b7'] },
  { id: 'dorian', name: 'Dorian', formula: [2, 1, 2, 2, 2, 1, 2], intervals: ['R', '2', 'b3', '4', '5', '6', 'b7'] },
  { id: 'phrygian', name: 'Phrygian', formula: [1, 2, 2, 2, 1, 2, 2], intervals: ['R', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'lydian', name: 'Lydian', formula: [2, 2, 2, 1, 2, 2, 1], intervals: ['R', '2', '3', '#4', '5', '6', '7'] },
  { id: 'mixolydian', name: 'Mixolydian', formula: [2, 2, 1, 2, 2, 1, 2], intervals: ['R', '2', '3', '4', '5', '6', 'b7'] },
  { id: 'harmonic_minor', name: 'Harmonic Minor', formula: [2, 1, 2, 2, 1, 3, 1], intervals: ['R', '2', 'b3', '4', '5', 'b6', '7'] },
];

export const getScaleNotes = (root: NoteName, formula: number[]): NoteName[] => {
  let i = CHROMATIC.indexOf(root);
  return [root, ...formula.slice(0, -1).map((step) => CHROMATIC[(i = (i + step) % 12)])];
};

export const getScaleById = (id: string): Scale | undefined => SCALES.find((s) => s.id === id);
