import { singleton } from 'tsyringe';
import { UpdateEyedropperPointerOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-pointer-operation';
import type { EyedropperPointerSample } from '../../../../model/eyedropper';

@singleton()
export class EyedropperOverlayMouseMoveController {
  constructor(
    private readonly updateEyedropperPointer: UpdateEyedropperPointerOperation,
  ) {}

  async run(pointer: EyedropperPointerSample): Promise<void> {
    this.updateEyedropperPointer.execute(pointer);
  }
}
