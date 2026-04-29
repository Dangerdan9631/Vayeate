import { singleton } from 'tsyringe';
import type { Size } from '../../../model/point';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class SetEyedropperOverlayViewportSizeOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(size: Size): void {
    this.eyedropperUiStore.getStore().setEyedropperOverlayViewportSize(size);
  }
}
