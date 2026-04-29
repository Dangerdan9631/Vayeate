import { singleton } from 'tsyringe';
import { SetWindowPositionOperation } from '../../../../domain/operations/window-operations/set-window-position-operation';
import { Point } from '../../../../model/point';

@singleton()
export class SyncWindowPositionController {
  constructor(private readonly setWindowPosition: SetWindowPositionOperation) {}

  run(position: Point): void {
    this.setWindowPosition.execute(position);
  }
}
