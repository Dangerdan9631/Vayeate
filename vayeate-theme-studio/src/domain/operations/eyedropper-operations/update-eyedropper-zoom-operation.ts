import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class UpdateEyedropperZoomOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(zoom: number): void {
    this.eyedropperUiStore.getStore().setEyedropperZoom(zoom);
  }
}
