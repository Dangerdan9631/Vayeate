import { Rect } from "../../model/rect";

export type ScreenshotDisplayEntry = {
  sourceId: string;
  bounds: Rect;
  png: Uint8Array;
};

export type ScreenshotFullDisplaySnapshot = {
  fullBounds: Rect;
  displays: ScreenshotDisplayEntry[];
};
