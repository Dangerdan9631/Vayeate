import { singleton } from 'tsyringe';
import { UpdateEyedropperPointerOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-pointer-operation';
import type { EyedropperPointerSample } from '../../../../model/eyedropper';

/**
 * Updates eyedropper pointer preview state as the cursor moves over the canvas.
 */
@singleton()
export class EyedropperOverlayMouseMoveController {
  constructor(
    private readonly updateEyedropperPointer: UpdateEyedropperPointerOperation,
  ) {}

  /**
   * Persists the latest pointer sample and preview hex in UI state.
   * @param pointer Client and canvas coordinates plus sampled color.
   * @returns A promise that settles when pointer state is updated.
   */
  async run(pointer: EyedropperPointerSample): Promise<void> {
    this.updateEyedropperPointer.execute(pointer);
  }
}
