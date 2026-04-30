export interface Point {
  x: number;
  y: number;
}

export const ZERO_POINT: Point = { x: 0, y: 0 };

export interface Size {
  width: number;
  height: number;
}

export const ZERO_SIZE: Size = { width: 0, height: 0 };

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ZERO_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };
