import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

/**
 * Reloads window through the window service.
 */

@singleton()
export class ReloadWindowOperation {
  constructor(private readonly windowService: WindowService) {}

  /**
   * Runs the reload window mutation.
   * @param force Force (unknown).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(force = false): void {
    if (force) {
      void this.windowService.reloadForce();
    } else {
      void this.windowService.reload();
    }
  }
}
