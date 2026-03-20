import { singleton } from 'tsyringe';
import { ReloadWindow } from '../../operations/window-operations';

@singleton()
export class ForceReloadWindowController {
  constructor(private readonly reloadWindow: ReloadWindow) {}

  async run(): Promise<void> {
    await this.reloadWindow.execute(true);
  }
}
