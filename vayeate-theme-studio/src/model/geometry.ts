/**
 * Two-dimensional point in pixel coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Origin point used as a default sentinel.
 */
export const ZERO_POINT: Point = { x: 0, y: 0 };

/**
 * Width and height pair for layout measurements.
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Zero size used as a default sentinel.
 */
export const ZERO_SIZE: Size = { width: 0, height: 0 };

/**
 * Axis-aligned rectangle in pixel coordinates.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Zero-origin rectangle with no area, used as a default sentinel.
 */
export const ZERO_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };
