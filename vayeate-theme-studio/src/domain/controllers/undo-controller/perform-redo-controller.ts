import { singleton } from 'tsyringe';
import { PerformRedoOperation } from '../../operations/undo-operations';

@singleton()
export class PerformRedoController {
  constructor(private readonly performRedo: PerformRedoOperation) {}

  async run(): Promise<void> {
    await this.performRedo.execute();
  }
}
