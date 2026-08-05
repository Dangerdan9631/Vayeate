import { useCallback, useMemo } from 'react';
import type { EyedropperDisplaySnapshotEntry, EyedropperPointerSample } from '../../../../model/Common/eyedropper';
import { useAppDispatch } from '../../../core/Queue/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../../domain/state/Common/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { EyedropperOverlayActionType } from '../../../actions/Common/eyedropper-overlay/eyedropper-overlay-action-type';
import { HexColor } from '../../../../model/Common/schema/primitives';
import { Rect, ZERO_RECT } from '../../../../model/Common/rect';
import { Size } from '../../../../model/Common/point';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

const EMPTY_DISPLAYS: EyedropperDisplaySnapshotEntry[] = [];

/**
 * Presentation state and callbacks for the eyedropper snapshot canvas.
 */
export interface EyedropperCanvasViewModel {
  canvasSize: Size;
  snapshotBounds: Rect;
  snapshotDisplays: EyedropperDisplaySnapshotEntry[];
  onCanvasMouseMove: (pointer: EyedropperPointerSample) => void;
  onCanvasClick: (hex: HexColor) => void;
}

/**
 * Subscribes to eyedropper UI state and exposes canvas sizing plus pointer/commit callbacks.
 * @returns View model for the eyedropper canvas component.
 */
export function useEyedropperCanvasViewModel(): EyedropperCanvasViewModel {
  const dispatch = useAppDispatch();

  const zoom = useStore(eyedropperUiStore.api, (state) => state.state.zoom);
  const snapshotBounds = useStore(eyedropperUiStore.api, (state) => state.state.snapshot?.fullBounds ?? ZERO_RECT);
  const snapshotDisplays = useStore(
    eyedropperUiStore.api,
    useShallow((state) => state.state.snapshot?.displays ?? EMPTY_DISPLAYS),
  );

  const canvasSize = useMemo(
    () => ({ width: snapshotBounds.width * zoom, height: snapshotBounds.height * zoom }),
    [snapshotBounds, zoom],
  );

  const onCanvasMouseMove = useCallback(
    (pointer: EyedropperPointerSample) => {
      void dispatch({ type: EyedropperOverlayActionType.OverlayMouseMove, pointer });
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
