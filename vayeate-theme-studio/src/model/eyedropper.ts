import type { Rect } from './geometry';

export interface EyedropperDisplayEntry {
  sourceId: string;
  bounds: Rect;
  bmp: ImageBitmap;
}

export interface EyedropperSnapshot {
  fullBounds: Rect;
  displays: EyedropperDisplayEntry[];
}
