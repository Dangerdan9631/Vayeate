import { Size, ZERO_SIZE } from "../../../model/point";
import { Rect, ZERO_RECT } from "../../../model/rect";

/**
 * Renderer window lifecycle phase tracked for shell initialization and teardown.
 */
export type WindowLoadState = 'loading' | 'loaded' | 'unloading';

/**
 * Electron window geometry, viewport size, and chrome state mirrored in the renderer.
 */
export interface WindowState {
  loadState: WindowLoadState;
  isMinimized: boolean;
  isMaximized: boolean;
  bounds: Rect;
  viewport: Size;
}

/**
 * Default window state before the main process reports bounds and viewport.
 */
export const initialWindowState: WindowState = {
  loadState: 'loading',
  isMinimized: false,
  isMaximized: false,
  bounds: ZERO_RECT,
  viewport: ZERO_SIZE,
};
