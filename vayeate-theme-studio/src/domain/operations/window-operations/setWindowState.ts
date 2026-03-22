import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

/**
 * Chrome action requested for the native window (close / minimize / maximize / restore).
 * Not the same as the app `window` slice in {@link AppState}.
 */
export type SetWindowStateTarget = 'close' | 'minimize' | 'maximize' | 'restore';

@singleton()
export class SetWindowState {
  constructor(private readonly windowService: WindowService) {}

  async execute(state: SetWindowStateTarget): Promise<void> {
    switch (state) {
      case 'close':
        await this.windowService.close();
        break;
      case 'minimize':
        await this.windowService.minimize();
        break;
      case 'maximize':
        await this.windowService.maximize();
        break;
      case 'restore':
        await this.windowService.restore();
        break;
      default: {
        const _exhaustive: never = state;
        void _exhaustive;
      }
    }
  }
}
