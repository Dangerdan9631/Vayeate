import type { HexColor } from '../../../model/schemas';

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

/**
 * JSON-shaped stash for a follow-up queue event after pick+commit (matches `AppAction` at runtime;
 * kept structural here so domain state does not depend on app action types).
 */
export type EyedropperPendingPostCommit = Record<string, unknown> & { type: string };

export interface EyedropperUiState {
  phase: EyedropperPhase;
  contextKey: string | null;
  snapshot: EyedropperSnapshotPayload | null;
  errorMessage: string | null;
  result: HexColor | null;
  pendingPostCommit: EyedropperPendingPostCommit | null;
}

export const closedEyedropperUiState: EyedropperUiState = {
  phase: 'closed',
  contextKey: null,
  snapshot: null,
  errorMessage: null,
  result: null,
  pendingPostCommit: null,
};
