import { singleton } from 'tsyringe';
import { windowService } from '../../../gateway/services/window-service';

@singleton()
export class DragWindow {
  async execute(): Promise<void> {
    await windowService.drag();
  }
}
