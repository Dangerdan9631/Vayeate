import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { useCallback, useMemo } from 'react';
import { Rect, ZERO_RECT } from '../../../model/rect';
import { Size } from '../../../model/point';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperOverlayViewModel {
  isOpen: boolean;
  isLoaded: boolean;
  errorMessage: string | null;
  previewHex: string | null;

  snapshotBounds: Rect;
  overlayViewportSize: Size;

  onOverlayViewportSizeChange: (size: Size) => void;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const isOpen = useStore(eyedropperUiStore.api, (state) => state.state.isOpen);
  const snapshot = useStore(eyedropperUiStore.api, (state) => state.state.snapshot);
  const snapshotBounds = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds ?? ZERO_RECT);
  const previewHex = useStore(eyedropperUiStore.api, (state) => state.state.previewHex);
  const errorMessage = useStore(eyedropperUiStore.api, (state) => state.state.errorMessage);
  const isLoaded = useMemo(() => isOpen && !errorMessage && snapshot !== null, [isOpen, errorMessage, snapshot]);

  const overlayViewportSize = useStore(eyedropperUiStore.api, (state) => state.state.overlayViewportSize);

  const onOverlayViewportSizeChange = useCallback((size: Size) => {
    void dispatch({ type: EyedropperOverlayActionType.OverlayViewportSizeChange, size });
  }, [dispatch]);

  return {  
    isOpen,
    isLoaded,
    errorMessage,
    previewHex,
    snapshotBounds,
    overlayViewportSize,
    onOverlayViewportSizeChange,
  };
}
