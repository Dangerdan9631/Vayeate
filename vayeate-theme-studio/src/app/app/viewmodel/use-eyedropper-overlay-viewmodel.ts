import { useContextSelector } from 'use-context-selector';
import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';

export interface EyedropperOverlayViewModel {
  dispatch: ReturnType<typeof useAppDispatch>;
  appViewport: { width: number; height: number };
  eyedropper: EyedropperUiState;
}

/** Dispatch, app viewport, and `state.ui.eyedropper` for the full-screen eyedropper overlay. */
export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const appViewport = useContextSelector(AppContext, (c) => c?.state.window.viewport);
  const eyedropper = useContextSelector(AppContext, (c) => c?.state.ui.eyedropper);
  if (appViewport === undefined || eyedropper === undefined) {
    throw new Error('useEyedropperOverlayViewModel must be used within AppProvider');
  }
  return { dispatch, appViewport, eyedropper };
}
