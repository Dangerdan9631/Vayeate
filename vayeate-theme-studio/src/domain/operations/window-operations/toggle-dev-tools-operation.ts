import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

/**
 * Toggles dev tools through the window service.
 */

@singleton()
export class ToggleDevToolsOperation {
  constructor(private readonly windowService: WindowService) {}

  /**
   * Runs the toggle dev tools mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    void this.windowService.toggleDevTools();
  }
}
