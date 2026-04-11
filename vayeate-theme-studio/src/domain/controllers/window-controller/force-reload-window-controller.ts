import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../operations/window-operations/reload-window-operation';

@singleton()
export class ForceReloadWindowController {
  constructor(private readonly reloadWindow: ReloadWindowOperation) {}

  async run(): Promise<void> {
    await this.reloadWindow.execute(true);
  }
}
