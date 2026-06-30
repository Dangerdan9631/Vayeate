import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

/**
 * Initiates window through the window service.
 */

@singleton()
export class DragWindowOperation {
  constructor(private readonly windowService: WindowService) {}

  /**
   * Runs the drag window mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    void this.windowService.drag();
  }
}
