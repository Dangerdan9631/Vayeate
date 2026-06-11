import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';

/**
 * Checks whether the native window is in a state that can be restored from maximize or minimize.
 */
@singleton()
export class ValidateCanRestoreWindow {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Reads the current window snapshot to see if restore is applicable.
   *
   * @returns `true` when the window is maximized or minimized.
   */
  test(): boolean {
    const { isMaximized, isMinimized } = this.windowStore.getStore().state;
    return isMaximized || isMinimized;
  }
}
