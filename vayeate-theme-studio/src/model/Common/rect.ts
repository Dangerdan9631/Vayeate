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
