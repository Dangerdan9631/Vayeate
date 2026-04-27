import { singleton } from 'tsyringe';
import { UpdateEyedropperMousePositionOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-mouse-position-operation';

@singleton()
export class EyedropperOverlayMouseMoveController {
  constructor(
    private readonly updateEyedropperMousePositionOperation: UpdateEyedropperMousePositionOperation,
  ) {}

  run(canvasX: number, canvasY: number): void {
    this.updateEyedropperMousePositionOperation.execute(canvasX, canvasY);
  }
}
