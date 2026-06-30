import type {
  EyedropperCommitTarget,
  EyedropperDisplaySnapshot,
  EyedropperPointerSample,
} from '../../../model/eyedropper';
import type { Size } from '../../../model/point';
import { ZERO_SIZE } from '../../../model/point';

/**
 * Eyedropper overlay UI state including capture snapshot, pointer, and commit target.
 */
export interface EyedropperUiState {
  isOpen: boolean;
  errorMessage: string | null;
  snapshot: EyedropperDisplaySnapshot | null;
  zoom: number;
  pointer: EyedropperPointerSample | null;
  commitTarget: EyedropperCommitTarget | null;
  overlayViewportSize: Size;
}

/**
 * Default eyedropper overlay state when the tool is closed.
 */
export const initialEyedropperUiState: EyedropperUiState = {
  isOpen: false,
  errorMessage: null,
  snapshot: null,
  zoom: 1,
  pointer: null,
  commitTarget: null,
  overlayViewportSize: ZERO_SIZE,
};
