import { AppAction } from '../../../app/core/action-queue/app-action';
import type { EyedropperSnapshot } from '../../../model/eyedropper';
import { Point, Size, ZERO_POINT, ZERO_SIZE } from '../../../model/geometry';
import type { HexColor } from '../../../model/schema/primitives';

export interface EyedropperUiState {
  isOpen: boolean;
  errorMessage: string | null;
  snapshot: EyedropperSnapshot | null;
  zoom: number;
  previewHex: string | null;
  result: HexColor | null;
  callbackAction: AppAction | null;
  mousePosition: Point;
  overlayViewportSize: Size; 
}

export const initialEyedropperUiState: EyedropperUiState = {
  isOpen: false,
  errorMessage: null,
  snapshot: null,
  zoom: 1,
  previewHex: null,
  result: null,
  callbackAction: null,
  mousePosition: ZERO_POINT,
  overlayViewportSize: ZERO_SIZE,
};
