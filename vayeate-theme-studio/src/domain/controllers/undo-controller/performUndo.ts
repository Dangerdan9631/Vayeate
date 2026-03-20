import { singleton } from 'tsyringe';
import { PerformUndo } from '../../operations/undo-operations';

@singleton()
export class PerformUndoController {
  constructor(private readonly performUndo: PerformUndo) {}

  async run(): Promise<void> {
    await this.performUndo.execute();
  }
}
