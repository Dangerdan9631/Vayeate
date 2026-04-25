import { singleton } from 'tsyringe';
import { SetWindowPositionOperation } from '../../../../domain/operations/window-operations/set-window-position-operation';
import { Position } from '../../../../domain/state/window/window-state';

@singleton()
export class SyncWindowPositionController {
  constructor(private readonly setWindowPosition: SetWindowPositionOperation) {}

  run(position: Position): void {
    this.setWindowPosition.execute(position);
  }
}
