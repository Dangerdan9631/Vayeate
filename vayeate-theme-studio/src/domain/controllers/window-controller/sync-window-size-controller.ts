import { singleton } from 'tsyringe';
import type { Size } from '../../state/window/window-state';
import { SetWindowSizeOperation } from '../../operations/window-operations/set-window-size-operation';

@singleton()
export class SyncWindowSizeController {
  constructor(private readonly setWindowSize: SetWindowSizeOperation) {}

  async run(size: Size): Promise<void> {
    this.setWindowSize.execute(size);
  }
}
