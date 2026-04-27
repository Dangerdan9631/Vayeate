import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { useCallback } from 'react';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import { HexColor } from '../../../model/schema/primitives';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperOverlayViewModel {
  snapshot: ImageBitmap | null,
  snapshotX: number;
  snapshotY: number;
  snapshotWidth: number;
  snapshotHeight: number;
  onCancelClick: () => void;
  onColorPickClick: (hex: HexColor) => void;
  onOverlayWheelScroll: (delta: number) => void;
  onOverlayMouseMove: (x: number, y: number, hex: HexColor) => void;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const snapshot = null;
  const snapshotX = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds.x ?? 0);
  const snapshotY = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds.y ?? 0);
  const snapshotWidth = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds.width ?? 0);
  const snapshotHeight = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds.height ?? 0);

  const onCancelClick = useCallback(() => {
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onColorPickClick = useCallback((hex: HexColor) => {
    void dispatch({ type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick, hex: hex });
  }, [dispatch]);

  const onOverlayWheelScroll = useCallback((delta: number) => {
    void dispatch({ type: EyedropperOverlayActionType.OverlayWheelOnScroll, delta: delta });
  }, [dispatch]);

  const onOverlayMouseMove = useCallback((x: number, y: number, hex: HexColor) => {
    eyedropperUiStore.setEyedropperPreviewHex(hex);
    void dispatch({ type: EyedropperOverlayActionType.OverlayMouseMove, x: x, y: y, hex });
  }, [dispatch]);

  return {
    snapshot,
    snapshotX,
    snapshotY,
    snapshotWidth,
    snapshotHeight,
    onCancelClick,
    onColorPickClick,
    onOverlayWheelScroll,
    onOverlayMouseMove,
  };
}
