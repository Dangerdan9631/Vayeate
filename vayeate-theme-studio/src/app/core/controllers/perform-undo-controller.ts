import { singleton } from 'tsyringe';
import { PerformUndoOperation } from '../../../domain/operations/undo-operations/perform-undo-operation';

@singleton()
export class PerformUndoController {
  constructor(private readonly performUndo: PerformUndoOperation) {}

  run(): void {
    this.performUndo.execute();
  }
}
