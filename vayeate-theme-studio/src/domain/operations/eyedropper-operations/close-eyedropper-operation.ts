import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class CloseEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(): void {
    this.eyedropperUiStore.getStore().closeEyedropper();
  }
}
