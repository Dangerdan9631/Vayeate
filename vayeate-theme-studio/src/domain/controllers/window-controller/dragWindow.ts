import { singleton } from 'tsyringe';
import { DragWindow } from '../../operations/window-operations';

@singleton()
export class DragWindowController {
  constructor(private readonly dragWindow: DragWindow) {}

  async run(): Promise<void> {
    await this.dragWindow.execute();
  }
}
