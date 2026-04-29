import { singleton } from 'tsyringe';
import type { EyedropperPointerSample } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class UpdateEyedropperPointerOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(pointer: EyedropperPointerSample): void {
    this.eyedropperUiStore.getStore().setEyedropperPointer(pointer);
  }
}
