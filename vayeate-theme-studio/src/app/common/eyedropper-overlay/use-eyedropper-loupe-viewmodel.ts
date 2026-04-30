import { useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { WindowStore } from '../../../domain/state/window/window-store';
import { EYEDROPPER_LOUPE_SIZE, loupeFixedPosition } from './eyedropper-utils';
import { Point } from '../../../model/geometry';

const windowStore = container.resolve(WindowStore);

export interface EyedropperLoupeViewModel {
  loupePos: { left: number; top: number } | null;
}

export function useEyedropperLoupeViewModel(
  pointer: { x: number; y: number } | null,
  isOpen: boolean,
  errorMessage: string | null,
): EyedropperLoupeViewModel {
  const appViewport = useStore(windowStore.api, (state) => state.state.viewport);

  const loupePos = useMemo(() => {
    const loupeVw = appViewport.width > 0 ? appViewport.width : 1;
    const loupeVh = appViewport.height > 0 ? appViewport.height : 1;
    return pointer && isOpen && errorMessage === null
      ? loupeFixedPosition(pointer.x, pointer.y, EYEDROPPER_LOUPE_SIZE, loupeVw, loupeVh)
      : null;
  }, [pointer, isOpen, errorMessage, appViewport]);

  return {
    loupePos,
  };
}
