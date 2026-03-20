import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class CloseWindow {
  async execute(): Promise<void> {
    await windowService.close();
  }
}
