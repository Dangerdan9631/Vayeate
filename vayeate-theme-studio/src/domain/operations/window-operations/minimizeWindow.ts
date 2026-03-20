import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class MinimizeWindow {
  async execute(): Promise<void> {
    await windowService.minimize();
  }
}
