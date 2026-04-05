import type { NoteName } from '@/types/music';

export type Tuning = {
  id: string;
  name: string;
  strings: NoteName[];
};

export const TUNINGS: Tuning[] = [
  {
    id: 'standard',
    name: 'Standard',
    strings: ['E', 'A', 'D', 'G', 'B', 'E'],
  },
];

export const getTuningById = (id: string): Tuning | undefined => TUNINGS.find((t) => t.id === id);
