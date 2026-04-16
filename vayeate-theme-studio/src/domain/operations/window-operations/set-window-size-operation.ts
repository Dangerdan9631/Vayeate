import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';
import type { Size } from '../../state/window/window-state';

@singleton()
export class SetWindowSizeOperation {
  constructor(private readonly windowStore: WindowStore) {}

  execute(size: Size): void {
    this.windowStore.getStore().setWindowSize(size);
  }
}
