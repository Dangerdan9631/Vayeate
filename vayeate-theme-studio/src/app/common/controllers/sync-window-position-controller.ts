import { singleton } from 'tsyringe';
import type { Position } from '../../../domain/state/window/window-state';
import { SetWindowPositionOperation } from '../../../domain/operations/window-operations/set-window-position-operation';

@singleton()
export class SyncWindowPositionController {
  constructor(private readonly setWindowPosition: SetWindowPositionOperation) {}

  run(position: Position): void {
    this.setWindowPosition.execute(position);
  }
}
