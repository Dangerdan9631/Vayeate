import { singleton } from 'tsyringe';
import { SetCurrentUndoStackId } from '../../operations/undo-operations';

/** Reset the current undo stack ID (e.g. on page navigation). */
@singleton()
export class ResetCurrentUndoStackIdController {
  constructor(private readonly setCurrentUndoStackId: SetCurrentUndoStackId) {}

  run(): void {
    this.setCurrentUndoStackId.execute(null);
  }
}
