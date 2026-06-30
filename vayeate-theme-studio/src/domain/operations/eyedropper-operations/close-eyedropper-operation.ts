import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

/**
 * Closes eyedropper in the UI store.
 */

@singleton()
export class CloseEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  /**
   * Runs the close eyedropper mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.eyedropperUiStore.getStore().closeEyedropper();
  }
}
