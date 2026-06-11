import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

/**
 * Updates eyedropper zoom in the store.
 */

@singleton()
export class UpdateEyedropperZoomOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  /**
   * Runs the update eyedropper zoom mutation.
   * @param zoom Zoom (number).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(zoom: number): void {
    this.eyedropperUiStore.getStore().setEyedropperZoom(zoom);
  }
}
