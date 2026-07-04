import { useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { EyedropperUiStore } from '../../../../domain/state/Common/ui/eyedropper-ui-store';
import { WindowStore } from '../../../../domain/state/Common/ui/window-store';
import type { EyedropperPointerSample } from '../../../../model/Common/eyedropper';
import { EYEDROPPER_LOUPE_SIZE, loupeFixedPosition } from '../../../components/Common/eyedropper-overlay/eyedropper-utils';

const eyedropperUiStore = container.resolve(EyedropperUiStore);
const windowStore = container.resolve(WindowStore);

/**
 * Presentation state for the eyedropper magnifier loupe.
 */
export interface EyedropperLoupeViewModel {
  pointer: EyedropperPointerSample | null;
  loupePosition: { left: number; top: number } | null;
}

/**
 * Derives loupe screen position from the current pointer sample and app viewport.
 * @param isOpen Whether the eyedropper overlay is open.
 * @param errorMessage Snapshot error message, or null when the canvas is usable.
 * @returns View model for the eyedropper loupe component.
 */
export function useEyedropperLoupeViewModel(
  isOpen: boolean,
  errorMessage: string | null,
): EyedropperLoupeViewModel {
  const pointer = useStore(eyedropperUiStore.api, (state) => state.state.pointer);
  const appViewport = useStore(windowStore.api, (state) => state.state.viewport);

  const loupePosition = useMemo(() => {
    const loupeVw = appViewport.width > 0 ? appViewport.width : 1;
    const loupeVh = appViewport.height > 0 ? appViewport.height : 1;
    return pointer && isOpen && errorMessage === null
      ? loupeFixedPosition(
        pointer.clientPosition.x,
        pointer.clientPosition.y,
        EYEDROPPER_LOUPE_SIZE,
        loupeVw,
        loupeVh,
      )
      : null;
  }, [pointer, isOpen, errorMessage, appViewport]);

  return {
    pointer,
    loupePosition,
  };
}
