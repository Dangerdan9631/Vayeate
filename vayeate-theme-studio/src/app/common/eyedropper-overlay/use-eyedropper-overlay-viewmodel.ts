import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { WindowStore } from '../../../domain/state/window/window-store';

const eyedropperUiStore = container.resolve(EyedropperUiStore);
const windowStore = container.resolve(WindowStore);

export interface EyedropperOverlayViewModel {
  dispatch: ReturnType<typeof useAppDispatch>;
  appViewport: { width: number; height: number };
  eyedropper: EyedropperUiState;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const appViewport = useStore(windowStore.api, (state) => state.state.viewport);
  const eyedropper = useStore(eyedropperUiStore.api, (state) => state.state);
  return { dispatch, appViewport, eyedropper };
}
