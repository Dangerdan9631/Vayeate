import { singleton } from 'tsyringe';
import { PerformRedo } from '../../operations/undo-operations';

@singleton()
export class PerformRedoController {
  constructor(private readonly performRedo: PerformRedo) {}

  async run(): Promise<void> {
    await this.performRedo.execute();
  }
}
