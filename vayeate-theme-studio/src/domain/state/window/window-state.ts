/** Width and height (e.g. window or viewport size). */
export interface Size {
  width: number;
  height: number;
}

/** X and Y coordinates (e.g. window position). */
export interface Position {
  x: number;
  y: number;
}

export type WindowLoadState = 'loading' | 'loaded' | 'unloading';

export interface WindowState {
  loadState: WindowLoadState;
  isMinimized: boolean;
  isMaximized: boolean;
  size: Size;
  position: Position;
  viewport: Size;
}

export const initialWindowState: WindowState = {
  loadState: 'loading',
  isMinimized: false,
  isMaximized: false,
  size: { width: 0, height: 0 },
  position: { x: 0, y: 0 },
  viewport: { width: 0, height: 0 },
};
