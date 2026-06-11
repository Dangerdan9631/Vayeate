import { singleton } from 'tsyringe';
import type { EyedropperCommitTarget } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

/**
 * Opens eyedropper in the UI store.
 */

@singleton()
export class OpenEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  /**
   * Runs the open eyedropper mutation.
   * @param commitTarget Commit target (EyedropperCommitTarget).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(commitTarget: EyedropperCommitTarget): void {
    this.eyedropperUiStore.getStore().openEyedropper(commitTarget);
  }
}
