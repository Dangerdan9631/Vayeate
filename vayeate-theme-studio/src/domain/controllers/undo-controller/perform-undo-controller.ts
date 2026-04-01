import { singleton } from 'tsyringe';
import { PerformUndoOperation } from '../../operations/undo-operations';

@singleton()
export class PerformUndoController {
  constructor(private readonly performUndo: PerformUndoOperation) {}

  async run(): Promise<void> {
    await this.performUndo.execute();
  }
}
