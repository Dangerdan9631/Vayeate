import { singleton } from 'tsyringe';
import { DragWindowOperation } from '../../../../domain/operations/window-operations/drag-window-operation';

/**
 * Starts a frameless window drag from the custom title bar.
 */
@singleton()
export class DragWindowController {
  constructor(private readonly dragWindow: DragWindowOperation) {}

  /**
   * Delegates title-bar drag to the Electron window service.
   */
  run(): void {
    this.dragWindow.execute();
  }
}
