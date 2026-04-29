import { useCallback, useMemo } from 'react';
import type { EyedropperDisplayEntryPayload } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import { HexColor } from '../../../model/schema/primitives';
import { Rect } from '../../../model/rect';
import { Point } from '../../../model/point';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export interface EyedropperCanvasViewModel {
  canvasSize: Point;
  snapshotBounds: Rect;
  snapshotDisplays: EyedropperDisplayEntryPayload[];
  onCanvasMouseMove: (canvasPosition: Point, hex: HexColor) => void;
  onCanvasClick: (hex: HexColor) => void;
}

export function useEyedropperCanvasViewModel(): EyedropperCanvasViewModel {
  const dispatch = useAppDispatch();

  const zoom = useStore(eyedropperUiStore.api, (state) => state.state.zoom);
  const snapshotBounds = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds ?? { x: 0, y: 0, width: 0, height: 0 });
  const snapshotDisplays = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.displays ?? []);

  const canvasSize = useMemo(
    () => ({ x: snapshotBounds.width * zoom, y: snapshotBounds.height * zoom }),
    [snapshotBounds, zoom],
  );

  const onCanvasMouseMove = useCallback(
    (canvasPosition: Point, hex: HexColor) => {
      void dispatch({ type: EyedropperOverlayActionType.OverlayMouseMove, position: canvasPosition, hex });
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
    canvasSize,
    snapshotBounds,
    snapshotDisplays,
    onCanvasMouseMove,
    onCanvasClick,
  };
}
