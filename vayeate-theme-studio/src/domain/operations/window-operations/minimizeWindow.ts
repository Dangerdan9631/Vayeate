import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class MinimizeWindow {
  constructor(private readonly windowService: WindowService) {}

  async execute(): Promise<void> {
    await this.windowService.minimize();
  }
}
