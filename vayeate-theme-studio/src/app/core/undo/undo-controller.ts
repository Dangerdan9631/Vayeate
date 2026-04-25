import { singleton } from 'tsyringe';
import { UndoOperation } from '../../../domain/operations/undo-operations/undo-operation';

@singleton()
export class UndoController {
  constructor(private readonly performUndo: UndoOperation) {}

  run(): void {
    this.performUndo.execute();
  }
}
