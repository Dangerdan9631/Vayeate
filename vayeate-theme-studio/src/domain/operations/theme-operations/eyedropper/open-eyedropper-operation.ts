import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';
import { AppAction } from '../../../../app/core/action-queue/app-action';

@singleton()
export class OpenEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(callbackAction: AppAction): void {
    this.eyedropperUiStore.getStore().openEyedropper(callbackAction);
  }
}
