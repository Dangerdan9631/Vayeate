import { singleton } from 'tsyringe';
import type { EyedropperUiState } from '../../../state/ui/eyedropper-ui-state';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';

/** Replace the full `ui.eyedropper` slice. */
@singleton()
export class SetEyedropperUiStateOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(eyedropper: EyedropperUiState): void {
    this.eyedropperUiStore.getStore().setState(eyedropper);
  }
}
