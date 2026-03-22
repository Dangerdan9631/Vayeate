import { singleton } from 'tsyringe';
import { SetWindowState } from '../../operations/window-operations';

@singleton()
export class CloseWindowController {
  constructor(private readonly setWindowState: SetWindowState) {}

  async run(): Promise<void> {
    await this.setWindowState.execute('close');
  }
}
