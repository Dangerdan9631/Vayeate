import { singleton } from 'tsyringe';
import type { Position } from '../../state/window/window-state';
import { SetWindowPositionOperation } from '../../operations/window-operations/set-window-position-operation';

@singleton()
export class SyncWindowPositionController {
  constructor(private readonly setWindowPosition: SetWindowPositionOperation) {}

  async run(position: Position): Promise<void> {
    this.setWindowPosition.execute(position);
  }
}
