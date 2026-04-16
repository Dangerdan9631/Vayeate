import { singleton } from 'tsyringe';
import type { WindowStateEvent } from '../../../gateway/services/window-service-types';
import { SetWindowDisplayStateOperation } from '../../operations/window-operations/set-window-display-state-operation';

@singleton()
export class SyncWindowDisplayStateController {
  constructor(private readonly setWindowDisplayState: SetWindowDisplayStateOperation) {}

  async run(event: WindowStateEvent): Promise<void> {
    this.setWindowDisplayState.execute(event);
  }
}
