import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';

@singleton()
export class DragWindowOperation {
  constructor(private readonly windowService: WindowService) {}

  execute(): void {
    void this.windowService.drag();
  }
}
