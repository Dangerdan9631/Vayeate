import { singleton } from 'tsyringe';
import { UpdateEyedropperMousePositionOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-mouse-position-operation';
import { Point } from '../../../../model/geometry';

@singleton()
export class EyedropperOverlayMouseMoveController {
  constructor(
    private readonly updateEyedropperMousePositionOperation: UpdateEyedropperMousePositionOperation,
  ) {}

  run(canvasPosition: Point): void {
    this.updateEyedropperMousePositionOperation.execute(canvasPosition);
  }
}
