import { singleton } from 'tsyringe';
import { Size } from '../../../../model/point';
import { SetEyedropperOverlayViewportSizeOperation } from '../../../../domain/operations/eyedropper-operations/set-eyedropper-overlay-viewport-size-operation';

@singleton()
export class EyedropperOverlayViewportSizeChangeController {
  constructor(
    private readonly setEyedropperOverlayViewportSize: SetEyedropperOverlayViewportSizeOperation,
  ) {}

  run(size: Size): void {
    this.setEyedropperOverlayViewportSize.execute(size);
  }
}