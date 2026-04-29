import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { useCallback, useMemo } from 'react';
import type { HexColor } from '../../../model/schema/primitives';
import type { Rect } from '../../../model/rect';
import { ZERO_RECT } from '../../../model/rect';
import type { Size } from '../../../model/point';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import {
  clampEyedropperZoomToFitRange,
  eyedropperZoomFitContain,
} from './eyedropper-utils';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperOverlayViewModel {
  isOpen: boolean;
  isLoaded: boolean;
  errorMessage: string | null;
  previewHex: HexColor | null;
  zoom: number;
  zoomFit: number;
  zoomVsFitLabel: string;
  innerSize: Size;
  snapshotBounds: Rect;
  overlayViewportSize: Size;
  onCancel: () => void;
  onOverlayWheelScroll: (deltaY: number) => void;
  onOverlayViewportSizeChange: (size: Size) => void;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const isOpen = useStore(eyedropperUiStore.api, (state) => state.state.isOpen);
  const snapshot = useStore(eyedropperUiStore.api, (state) => state.state.snapshot);
  const snapshotBounds = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds ?? ZERO_RECT);
  const previewHex = useStore(eyedropperUiStore.api, (state) => state.state.pointer?.previewHex ?? null);
  const zoom = useStore(eyedropperUiStore.api, (state) => state.state.zoom);
  const errorMessage = useStore(eyedropperUiStore.api, (state) => state.state.errorMessage);
  const isLoaded = useMemo(() => isOpen && !errorMessage && snapshot !== null, [isOpen, errorMessage, snapshot]);

  const overlayViewportSize = useStore(eyedropperUiStore.api, (state) => state.state.overlayViewportSize);

  const zoomFit = useMemo(() => eyedropperZoomFitContain(
    overlayViewportSize.width,
    overlayViewportSize.height,
    snapshotBounds.width,
    snapshotBounds.height,
  ), [overlayViewportSize, snapshotBounds]);

  const layoutScale = zoomFit > 0 ? Math.max(clampEyedropperZoomToFitRange(zoom, zoomFit), zoomFit) : zoom;
  const innerSize = useMemo(() => ({
    width: snapshotBounds.width * layoutScale,
    height: snapshotBounds.height * layoutScale,
  }), [snapshotBounds, layoutScale]);

  const zoomVsFitLabel = zoomFit > 0 ? `${(zoom / zoomFit).toFixed(2)}x fit` : `${zoom.toFixed(2)}x`;

  const onCancel = useCallback(() => {
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onOverlayWheelScroll = useCallback((deltaY: number) => {
    void dispatch({ type: EyedropperOverlayActionType.OverlayWheelOnScroll, deltaY });
  }, [dispatch]);

  const onOverlayViewportSizeChange = useCallback((size: Size) => {
    void dispatch({ type: EyedropperOverlayActionType.OverlayViewportSizeChange, size });
  }, [dispatch]);

  return {
    isOpen,
    isLoaded,
    errorMessage,
    previewHex,
    zoom,
    zoomFit,
    zoomVsFitLabel,
    innerSize,
    snapshotBounds,
    overlayViewportSize,
    onCancel,
    onOverlayWheelScroll,
    onOverlayViewportSizeChange,
  };
}
