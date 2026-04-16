import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';
import type { Position } from '../../state/window/window-state';

@singleton()
export class SetWindowPositionOperation {
  constructor(private readonly windowStore: WindowStore) {}

  execute(position: Position): void {
    this.windowStore.getStore().setWindowPosition(position);
  }
}
