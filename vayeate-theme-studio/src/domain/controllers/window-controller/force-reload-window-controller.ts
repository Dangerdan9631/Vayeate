import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../operations/window-operations/reload-window-operation';

@singleton()
export class ForceReloadWindowController {
  constructor(private readonly reloadWindow: ReloadWindowOperation) {}

  run(): void {
    this.reloadWindow.execute(true);
  }
}
