import type { NoteName } from '@/types/music';

export const CHROMATIC: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getNoteAtFret = (open: NoteName, fret: number): NoteName =>
  CHROMATIC[(CHROMATIC.indexOf(open) + fret) % 12];
