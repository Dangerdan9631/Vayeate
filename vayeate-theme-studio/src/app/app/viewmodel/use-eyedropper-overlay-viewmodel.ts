import { useContextSelector } from 'use-context-selector';
import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperOverlayViewModel {
  dispatch: ReturnType<typeof useAppDispatch>;
  appViewport: { width: number; height: number };
  eyedropper: EyedropperUiState;
}

/** Dispatch, app viewport, and `state.ui.eyedropper` for the full-screen eyedropper overlay. */
export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const appViewport = useContextSelector(AppContext, (c) => c?.state.window.viewport);
  const eyedropper = useStore(eyedropperUiStore.api, (state) => state.state);
  if (appViewport === undefined || eyedropper === undefined) {
    throw new Error('useEyedropperOverlayViewModel must be used within AppProvider');
  }
  return { dispatch, appViewport, eyedropper };
}
