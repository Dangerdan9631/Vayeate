import { singleton } from 'tsyringe';
import { RedoOperation } from '../../../domain/operations/undo-operations/redo-operation';

@singleton()
export class RedoController {
  constructor(private readonly performRedo: RedoOperation) {}

  run(): void {
    this.performRedo.execute();
  }
}
