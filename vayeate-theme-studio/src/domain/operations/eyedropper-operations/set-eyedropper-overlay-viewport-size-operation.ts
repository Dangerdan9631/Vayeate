import { singleton } from 'tsyringe';
import type { Size } from '../../../model/point';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

/**
 * Updates eyedropper overlay viewport size in the domain or UI store.
 */

@singleton()
export class SetEyedropperOverlayViewportSizeOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  /**
   * Runs the set eyedropper overlay viewport size mutation.
   * @param size Size (Size).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(size: Size): void {
    this.eyedropperUiStore.getStore().setEyedropperOverlayViewportSize(size);
  }
}
