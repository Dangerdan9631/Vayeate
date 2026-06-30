import { singleton } from 'tsyringe';
import { WindowStore } from '../../state/ui/window-store';

/**
 * Checks whether the native window can be minimized from its current state.
 */
@singleton()
export class ValidateCanMinimizeWindow {
  constructor(private readonly windowStore: WindowStore) {}

  /**
   * Reads the current window snapshot to see if minimize is allowed.
   *
   * @returns `true` when the window is not already minimized.
   */
  test(): boolean {
    return !this.windowStore.getStore().state.isMinimized;
  }
}
