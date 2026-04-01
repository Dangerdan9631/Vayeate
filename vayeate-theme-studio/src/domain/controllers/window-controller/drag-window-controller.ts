import { singleton } from 'tsyringe';
import { DragWindowOperation } from '../../operations/window-operations';

@singleton()
export class DragWindowController {
  constructor(private readonly dragWindow: DragWindowOperation) {}

  async run(): Promise<void> {
    await this.dragWindow.execute();
  }
}
