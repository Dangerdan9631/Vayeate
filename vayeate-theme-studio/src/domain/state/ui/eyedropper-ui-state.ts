import { AppAction } from '../../../app/core/action-queue/app-action';
import type { HexColor } from '../../../model/schema/primitives';

export interface EyedropperDisplayEntryPayload {
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bmp: ImageBitmap;
}

export interface EyedropperSnapshotPayload {
  fullBounds: { x: number; y: number; width: number; height: number };
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
  mouseX: number;
  mouseY: number;
}

export const initialEyedropperUiState: EyedropperUiState = {
  isOpen: false,
  errorMessage: null,
  snapshot: null,
  zoom: 1,
  previewHex: null,
  result: null,
  callbackAction: null,
  mouseX: 0,
  mouseY: 0,
};
