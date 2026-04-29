import { Size, ZERO_SIZE } from "../../../model/point";
import { Rect, ZERO_RECT } from "../../../model/rect";

export type WindowLoadState = 'loading' | 'loaded' | 'unloading';

export interface WindowState {
  loadState: WindowLoadState;
  isMinimized: boolean;
  isMaximized: boolean;
  bounds: Rect;
  viewport: Size;
}

export const initialWindowState: WindowState = {
  loadState: 'loading',
  isMinimized: false,
  isMaximized: false,
  bounds: ZERO_RECT,
  viewport: ZERO_SIZE,
};
