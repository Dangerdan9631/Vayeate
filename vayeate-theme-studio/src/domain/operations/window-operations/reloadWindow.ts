import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class ReloadWindow {
  async execute(force = false): Promise<void> {
    if (force) {
      await windowService.reloadForce();
    } else {
      await windowService.reload();
    }
  }
}
