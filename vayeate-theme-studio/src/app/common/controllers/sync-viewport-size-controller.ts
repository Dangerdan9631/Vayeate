import { singleton } from 'tsyringe';
import type { Size } from '../../../domain/state/window/window-state';
import { SetViewportSizeOperation } from '../../../domain/operations/window-operations/set-viewport-size-operation';

@singleton()
export class SyncViewportSizeController {
  constructor(private readonly setViewportSize: SetViewportSizeOperation) {}

  run(size: Size): void {
    this.setViewportSize.execute(size);
  }
}
