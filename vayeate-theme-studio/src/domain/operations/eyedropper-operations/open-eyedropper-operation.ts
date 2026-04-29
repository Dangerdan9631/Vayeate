import { singleton } from 'tsyringe';
import type { EyedropperCommitTarget } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class OpenEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(commitTarget: EyedropperCommitTarget): void {
    this.eyedropperUiStore.getStore().openEyedropper(commitTarget);
  }
}
