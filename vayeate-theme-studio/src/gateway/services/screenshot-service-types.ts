import type { Rect } from '../../model/rect';

/**
 * One display's bounds and PNG bytes from a full-display snapshot.
 */
export type ScreenshotDisplayEntry = {
  sourceId: string;
  bounds: Rect;
  png: Uint8Array;
};

/**
 * Combined bounds and per-display captures for eyedropper sampling.
 */
export type ScreenshotFullDisplaySnapshot = {
  fullBounds: Rect;
  displays: ScreenshotDisplayEntry[];
};
