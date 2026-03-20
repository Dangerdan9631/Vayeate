import { singleton } from 'tsyringe';
import { ToggleDevTools } from '../../operations/window-operations';

@singleton()
export class ToggleDevToolsController {
  constructor(private readonly toggleDevTools: ToggleDevTools) {}

  async run(): Promise<void> {
    await this.toggleDevTools.execute();
  }
}
