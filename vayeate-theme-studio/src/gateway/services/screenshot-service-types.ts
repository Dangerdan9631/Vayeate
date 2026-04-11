export type ScreenshotDisplayEntry = {
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  png: Uint8Array;
};

export type ScreenshotFullDisplaySnapshot = {
  fullBounds: { x: number; y: number; width: number; height: number };
  displays: ScreenshotDisplayEntry[];
};
