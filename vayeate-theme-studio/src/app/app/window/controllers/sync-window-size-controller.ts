import { singleton } from 'tsyringe';
import type { Size } from '../../../../domain/state/window/window-state';
import { SetWindowSizeOperation } from '../../../../domain/operations/window-operations/set-window-size-operation';

@singleton()
export class SyncWindowSizeController {
  constructor(private readonly setWindowSize: SetWindowSizeOperation) {}

  run(size: Size): void {
    this.setWindowSize.execute(size);
  }
}
