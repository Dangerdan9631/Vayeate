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
