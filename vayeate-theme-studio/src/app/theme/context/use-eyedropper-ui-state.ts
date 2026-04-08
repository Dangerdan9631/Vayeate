import { useContextSelector } from 'use-context-selector';
import type { EyedropperUiState } from '../types/eyedropper-ui';
import { AppContext } from '../../core/components/AppProvider';

export function useEyedropperUiState(): EyedropperUiState {
  const eyedropperState = useContextSelector(AppContext, (c) => c?.state.ui.eyedropper);
  if (eyedropperState === undefined) {
    throw new Error('useEyedropperUiState must be used within AppProvider');
  }
  return eyedropperState;
}
