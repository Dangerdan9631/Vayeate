import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../operations/window-operations';

@singleton()
export class ReloadWindowController {
  constructor(private readonly reloadWindow: ReloadWindowOperation) {}

  async run(): Promise<void> {
    await this.reloadWindow.execute(false);
  }
}
