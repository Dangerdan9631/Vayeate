import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations/set-window-state-operation';

@singleton()
export class CloseWindowController {
  constructor(private readonly setWindowState: SetWindowStateOperation) {}

  async run(): Promise<void> {
    await this.setWindowState.execute('close');
  }
}
