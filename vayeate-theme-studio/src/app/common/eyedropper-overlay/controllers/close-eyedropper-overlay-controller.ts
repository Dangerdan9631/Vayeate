import { singleton } from 'tsyringe';
import { CloseEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/close-eyedropper-operation';

@singleton()
export class CloseEyedropperOverlayController {
  constructor(private readonly closeEyedropper: CloseEyedropperOperation) {}

  run(): void {
    this.closeEyedropper.execute(null);
  }
}
