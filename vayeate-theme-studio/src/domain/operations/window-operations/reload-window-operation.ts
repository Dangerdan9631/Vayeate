import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class ReloadWindowOperation {
  constructor(private readonly windowService: WindowService) {}

  execute(force = false): void {
    if (force) {
      void this.windowService.reloadForce();
    } else {
      void this.windowService.reload();
    }
  }
}
