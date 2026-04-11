import { singleton } from 'tsyringe';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class LoadCatalogPageController {
  constructor(private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation) {}

  async run(): Promise<void> {
    this.setCurrentUndoStackId.execute(null);
  }
}
