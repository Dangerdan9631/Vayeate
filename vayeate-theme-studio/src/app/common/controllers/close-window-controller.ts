import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../domain/operations/window-operations/set-window-state-operation';

@singleton()
export class CloseWindowController {
  constructor(private readonly setWindowState: SetWindowStateOperation) {}

  run(): void {
    this.setWindowState.execute('close');
  }
}
