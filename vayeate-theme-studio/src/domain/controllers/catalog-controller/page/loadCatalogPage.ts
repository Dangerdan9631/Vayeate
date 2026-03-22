import { singleton } from 'tsyringe';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class LoadCatalogPageController {
  constructor(private readonly setCurrentUndoStackId: SetCurrentUndoStackId) {}

  async run(): Promise<void> {
    this.setCurrentUndoStackId.execute(null);
  }
}
