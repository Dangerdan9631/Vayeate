import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';
import type { HexColor } from '../../../model/schema/primitives';

@singleton()
export class CloseEyedropperOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(result: HexColor | null): void {
    this.eyedropperUiStore.getStore().closeEyedropper(result);
  }
}
