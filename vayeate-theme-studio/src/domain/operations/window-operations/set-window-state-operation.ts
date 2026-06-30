import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

/**
 * Chrome action requested for the native window (close / minimize / maximize / restore).
 * Not the same as the app `window` slice in {@link AppState}.
 */
export type SetWindowStateTarget = 'close' | 'minimize' | 'maximize' | 'restore';

/**
 * Updates window state in the domain or UI store.
 */

@singleton()
export class SetWindowStateOperation {
  constructor(private readonly windowService: WindowService) {}

  /**
   * Runs the set window state mutation.
   * @param state State (SetWindowStateTarget).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(state: SetWindowStateTarget): void {
    switch (state) {
      case 'close':
        void this.windowService.close();
        break;
      case 'minimize':
        void this.windowService.minimize();
        break;
      case 'maximize':
        void this.windowService.maximize();
        break;
      case 'restore':
        void this.windowService.restore();
        break;
      default: {
        const _exhaustive: never = state;
        void _exhaustive;
      }
    }
  }
}
