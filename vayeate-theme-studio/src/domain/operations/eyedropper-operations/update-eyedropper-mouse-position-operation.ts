import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';
import { Point } from '../../../model/point';

@singleton()
export class UpdateEyedropperMousePositionOperation {
  constructor(private readonly eyedropperUiStore: EyedropperUiStore) {}

  execute(position: Point): void {
    this.eyedropperUiStore.getStore().setEyedropperMousePosition(position);
  }
}
