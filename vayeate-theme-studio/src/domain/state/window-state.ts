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

/** Parallel state: window/app shell (not yet used in app/reducer). */
export interface WindowState {
  loadState: WindowLoadState;
  isMinimized: boolean;
  isMaximized: boolean;
  size: Size;
  position: Position;
}
