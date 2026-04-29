import { AppAction } from '../../../app/core/action-queue/app-action';
import { Rect } from '../../../model/rect';
import type { HexColor } from '../../../model/schema/primitives';
import { Point, Size, ZERO_POINT, ZERO_SIZE } from '../../../model/point';

export interface EyedropperDisplayEntryPayload {
  sourceId: string;
  bounds: Rect;
  bmp: ImageBitmap;
}

export interface EyedropperSnapshotPayload {
  fullBounds: Rect;
  displays: EyedropperDisplayEntryPayload[];
}

export interface EyedropperUiState {
  isOpen: boolean;
  errorMessage: string | null;
  snapshot: EyedropperSnapshotPayload | null;
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
