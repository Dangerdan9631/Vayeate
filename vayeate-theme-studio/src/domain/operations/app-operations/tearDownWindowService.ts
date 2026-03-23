import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class TearDownWindowService {
  constructor(
    private readonly windowService: WindowService
  ) {}

  execute(): void {
    this.windowService.dispose();
  }
}
