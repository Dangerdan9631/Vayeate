import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class ToggleDevTools {
  async execute(): Promise<void> {
    await windowService.toggleDevTools();
  }
}
