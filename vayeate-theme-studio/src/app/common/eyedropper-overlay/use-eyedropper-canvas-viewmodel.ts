import { useCallback, useMemo } from 'react';
import type { EyedropperDisplayEntryPayload } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import { HexColor } from '../../../model/schema/primitives';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperCanvasViewModel {
  canvasWidth: number;
  canvasHeight: number;
  snapshotWidth: number;
  snapshotX: number;
  snapshotY: number;
  snapshotHeight: number;
  snapshotDisplays: EyedropperDisplayEntryPayload[];
  onCanvasMouseMove: (canvasX: number, canvasY: number, hex: HexColor) => void;
  onCanvasClick: (hex: HexColor) => void;
}

export function useEyedropperCanvasViewModel(): EyedropperCanvasViewModel {
  const dispatch = useAppDispatch();

  const zoom = useStore(eyedropperUiStore.api, (state) => state.state.zoom);
  const snapshotX = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds?.x ?? 0);
  const snapshotY = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds?.y ?? 0);
  const snapshotWidth = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds?.width ?? 0);
  const snapshotHeight = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds?.height ?? 0);
  const snapshotDisplays = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.displays ?? []);

  const canvasWidth = useMemo(
    () => snapshotWidth * zoom,
    [snapshotWidth, zoom],
  );
  const canvasHeight = useMemo(
    () => snapshotHeight * zoom,
    [snapshotHeight, zoom],
  );

  const onCanvasMouseMove = useCallback(
    (canvasX: number, canvasY: number, hex: HexColor) => {
      void dispatch({ type: EyedropperOverlayActionType.OverlayMouseMove, x: canvasX, y: canvasY, hex });
    },
    [dispatch],
  );

  const onCanvasClick = useCallback(
    (hex: HexColor) => {
      void dispatch({ type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick, hex });
    },
    [dispatch],
  );

  return {
    canvasWidth,
    canvasHeight,
    snapshotX,
    snapshotY,
    snapshotWidth,
    snapshotHeight,
    snapshotDisplays,
    onCanvasMouseMove,
    onCanvasClick,
  };
}
