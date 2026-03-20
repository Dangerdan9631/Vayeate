import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class MaximizeWindow {
  async execute(): Promise<void> {
    await windowService.maximize();
  }
}
