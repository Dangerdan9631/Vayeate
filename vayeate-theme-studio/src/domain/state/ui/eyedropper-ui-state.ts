/** UI-only state for the full-screen eyedropper overlay (in-memory snapshot; not persisted). */

export type EyedropperPhase = 'closed' | 'loading' | 'ready' | 'error';

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
  phase: EyedropperPhase;
  /** Intent key, e.g. `eyedropper:dark:ref`, `eyedropper:assign:colorRef`. */
  contextKey: string | null;
  snapshot: EyedropperSnapshotPayload | null;
  errorMessage: string | null;
}

export const closedEyedropperUiState: EyedropperUiState = {
  phase: 'closed',
  contextKey: null,
  snapshot: null,
  errorMessage: null,
};
