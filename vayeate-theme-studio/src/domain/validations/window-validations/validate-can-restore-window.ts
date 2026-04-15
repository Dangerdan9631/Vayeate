import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/window/window-store';

@singleton()
export class ValidateCanRestoreWindow {
  constructor(private readonly windowStore: WindowStore) {}

  test(): boolean {
    const { isMaximized, isMinimized } = this.windowStore.getStore().state;
    return isMaximized || isMinimized;
  }
}
