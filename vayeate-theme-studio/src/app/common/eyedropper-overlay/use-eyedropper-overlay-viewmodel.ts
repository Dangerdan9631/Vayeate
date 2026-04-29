import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { useCallback } from 'react';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import { HexColor } from '../../../model/schema/primitives';
import { Point } from '../../../model/point';
import { Rect } from '../../../model/rect';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperOverlayViewModel {
  snapshotBounds: Rect;
  onCancelClick: () => void;
  onColorPickClick: (hex: HexColor) => void;
  onOverlayWheelScroll: (delta: number) => void;
  onOverlayMouseMove: (position: Point, hex: HexColor) => void;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const snapshotBounds = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds ?? { x: 0, y: 0, width: 0, height: 0 });

  const onCancelClick = useCallback(() => {
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onColorPickClick = useCallback((hex: HexColor) => {
    void dispatch({ type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick, hex: hex });
  }, [dispatch]);

  const onOverlayWheelScroll = useCallback((delta: number) => {
    void dispatch({ type: EyedropperOverlayActionType.OverlayWheelOnScroll, delta: delta });
  }, [dispatch]);

  const onOverlayMouseMove = useCallback((position: Point, hex: HexColor) => {
    eyedropperUiStore.setEyedropperPreviewHex(hex);
    void dispatch({ type: EyedropperOverlayActionType.OverlayMouseMove, position, hex });
  }, [dispatch]);

  return {
    snapshotBounds,
    onCancelClick,
    onColorPickClick,
    onOverlayWheelScroll,
    onOverlayMouseMove,
  };
}
