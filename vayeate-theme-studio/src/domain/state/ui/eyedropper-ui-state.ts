import type {
  EyedropperCommitTarget,
  EyedropperDisplaySnapshot,
  EyedropperPointerSample,
} from '../../../model/eyedropper';
import type { Size } from '../../../model/point';
import { ZERO_SIZE } from '../../../model/point';

export interface EyedropperUiState {
  isOpen: boolean;
  errorMessage: string | null;
  snapshot: EyedropperDisplaySnapshot | null;
  zoom: number;
  pointer: EyedropperPointerSample | null;
  commitTarget: EyedropperCommitTarget | null;
  overlayViewportSize: Size;
}

export const initialEyedropperUiState: EyedropperUiState = {
  isOpen: false,
  errorMessage: null,
  snapshot: null,
  zoom: 1,
  pointer: null,
  commitTarget: null,
  overlayViewportSize: ZERO_SIZE,
};
