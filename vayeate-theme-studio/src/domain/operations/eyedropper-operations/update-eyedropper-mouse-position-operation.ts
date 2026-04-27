import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class UpdateEyedropperMousePositionOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(x: number, y: number): void {
    this.eyedropperUiStore.getStore().setEyedropperMousePosition(x, y);
  }
}
