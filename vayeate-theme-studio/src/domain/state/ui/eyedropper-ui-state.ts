import { AppAction } from '../../../app/core/action-queue/app-action';
import type { HexColor } from '../../../model/schema/primitives';

export interface EyedropperDisplayEntryPayload {
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  png: Uint8Array;
}

export interface EyedropperSnapshotPayload {
  fullBounds: { x: number; y: number; width: number; height: number };
  displays: EyedropperDisplayEntryPayload[];
}

export interface EyedropperUiState {
  isOpen: boolean;
  errorMessage: string | null;
  result: HexColor | null;
  callbackAction: AppAction | null;
  snapshot: EyedropperSnapshotPayload | null;
}

export const initialEyedropperUiState: EyedropperUiState = {
  isOpen: false,
  errorMessage: null,
  result: null,
  callbackAction: null,
  snapshot: null,
};
