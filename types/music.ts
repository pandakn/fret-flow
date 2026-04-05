export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type IntervalName = 'R' | 'b2' | '2' | 'b3' | '3' | '4' | 'b5' | '#4' | '5' | 'b6' | '#5' | '6' | 'b7' | '7';

export type FretNote = {
  string: number;
  fret: number;
  note: NoteName;
  interval: IntervalName | null;
  isRoot: boolean;
  isActive: boolean;
};
