import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class CloseWindow {
  constructor(private readonly windowService: WindowService) {}

  async execute(): Promise<void> {
    await this.windowService.close();
  }
}
