import { singleton } from 'tsyringe';
import type { EyedropperPointerSample } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

/**
 * Updates eyedropper pointer in the store.
 */

@singleton()
export class UpdateEyedropperPointerOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  /**
   * Runs the update eyedropper pointer mutation.
   * @param pointer Pointer (EyedropperPointerSample).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(pointer: EyedropperPointerSample): void {
    this.eyedropperUiStore.getStore().setEyedropperPointer(pointer);
  }
}
