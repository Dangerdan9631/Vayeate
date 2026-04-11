import { singleton } from 'tsyringe';
import { SetCurrentUndoStackIdOperation } from '../../operations/undo-operations/set-current-undo-stack-id-operation';

/** Reset the current undo stack ID (e.g. on page navigation). */
@singleton()
export class ResetCurrentUndoStackIdController {
  constructor(private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation) {}

  async run(): Promise<void> {
    this.setCurrentUndoStackId.execute(null);
  }
}
