import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../../gateway/services/window-service-types';
import { SetWindowDisplayStateOperation } from '../../../../domain/operations/window-operations/set-window-display-state-operation';

@singleton()
export class SyncWindowDisplayStateController {
  constructor(private readonly setWindowDisplayState: SetWindowDisplayStateOperation) {}

  run(event: WindowStateEvent): void {
    this.setWindowDisplayState.execute(event);
  }
}
