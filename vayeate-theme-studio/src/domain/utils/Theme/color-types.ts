/**
 * RGB color with channels normalized to [0, 1].
 */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color with hue in [0, 1] and saturation/lightness in [0, 1].
 */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/**
 * HSV color with hue in [0, 1] and saturation/value in [0, 1].
 */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/**
 * Comparison operator used when adjusting a color to meet a contrast target.
 */
export type ContrastComparisonMethod = 'lessThan' | 'equalTo' | 'greaterThan';

/**
 * Inputs for {@link adjustColorToMeetContrast} describing the contrast constraint.
 */
export interface AdjustContrastOptions {
  comparisonMethod: ContrastComparisonMethod;
  value: number;
  min?: number | null;
  max?: number | null;
}
