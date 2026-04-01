import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class TearDownWindowServiceOperation {
  constructor(
    private readonly windowService: WindowService
  ) {}

  execute(): void {
    this.windowService.dispose();
  }
}
