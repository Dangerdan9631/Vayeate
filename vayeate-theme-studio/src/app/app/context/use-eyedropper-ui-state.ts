import { useContextSelector } from 'use-context-selector';
import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import { AppContext } from '../../core/context/AppContext';

export function useEyedropperUiState(): EyedropperUiState {
  const eyedropperState = useContextSelector(AppContext, (c) => c?.state.ui.eyedropper);
  if (eyedropperState === undefined) {
    throw new Error('useEyedropperUiState must be used within AppProvider');
  }
  return eyedropperState;
}
