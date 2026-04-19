import { singleton } from 'tsyringe';
import { PerformRedoOperation } from '../../../domain/operations/undo-operations/perform-redo-operation';

@singleton()
export class PerformRedoController {
  constructor(private readonly performRedo: PerformRedoOperation) {}

  run(): void {
    this.performRedo.execute();
  }
}
