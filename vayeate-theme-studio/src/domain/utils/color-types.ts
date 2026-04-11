export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export type ContrastComparisonMethod = 'lessThan' | 'equalTo' | 'greaterThan';

export interface AdjustContrastOptions {
  comparisonMethod: ContrastComparisonMethod;
  value: number;
  min?: number | null;
  max?: number | null;
}
