import { singleton } from 'tsyringe';
import { CloseWindow } from '../../operations/window-operations';

@singleton()
export class CloseWindowController {
  constructor(private readonly closeWindow: CloseWindow) {}

  async run(): Promise<void> {
    await this.closeWindow.execute();
  }
}
