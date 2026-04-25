import { singleton } from 'tsyringe';
import { DragWindowOperation } from '../../../../domain/operations/window-operations/drag-window-operation';

@singleton()
export class DragWindowController {
  constructor(private readonly dragWindow: DragWindowOperation) {}

  run(): void {
    this.dragWindow.execute();
  }
}
