import { singleton } from 'tsyringe';
import type { Size } from '../../state/window/window-state';
import { SetViewportSizeOperation } from '../../operations/window-operations/set-viewport-size-operation';

@singleton()
export class SyncViewportSizeController {
  constructor(private readonly setViewportSize: SetViewportSizeOperation) {}

  async run(size: Size): Promise<void> {
    this.setViewportSize.execute(size);
  }
}
