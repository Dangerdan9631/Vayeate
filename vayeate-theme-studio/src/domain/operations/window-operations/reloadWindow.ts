import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class ReloadWindow {
  constructor(private readonly windowService: WindowService) {}

  async execute(force = false): Promise<void> {
    if (force) {
      await this.windowService.reloadForce();
    } else {
      await this.windowService.reload();
    }
  }
}
