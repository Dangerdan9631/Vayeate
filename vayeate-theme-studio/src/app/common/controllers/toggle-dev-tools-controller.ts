import { singleton } from 'tsyringe';
import { ToggleDevToolsOperation } from '../../../domain/operations/window-operations/toggle-dev-tools-operation';

@singleton()
export class ToggleDevToolsController {
  constructor(private readonly toggleDevTools: ToggleDevToolsOperation) {}

  run(): void {
    this.toggleDevTools.execute();
  }
}
