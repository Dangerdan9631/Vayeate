import { singleton } from 'tsyringe';
import { ToggleDevToolsOperation } from '../../operations/window-operations/toggle-dev-tools-operation';

@singleton()
export class ToggleDevToolsController {
  constructor(private readonly toggleDevTools: ToggleDevToolsOperation) {}

  async run(): Promise<void> {
    await this.toggleDevTools.execute();
  }
}
