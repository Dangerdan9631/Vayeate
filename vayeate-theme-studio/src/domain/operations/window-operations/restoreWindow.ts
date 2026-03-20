import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class RestoreWindow {
  async execute(): Promise<void> {
    await windowService.restore();
  }
}
