import { singleton } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import { ApplyWindowStateUpdate, mapWindowStateEventToUpdate } from '../window-operations';

@singleton()
export class InitializeWindowService {
  constructor(
    private readonly windowService: WindowService,
    private readonly applyWindowStateUpdate: ApplyWindowStateUpdate,
  ) {}

  execute(): void {
    this.windowService.init(
      (event) => {
        this.applyWindowStateUpdate.execute(mapWindowStateEventToUpdate(event));
      },
      (size) => {
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_SIZE', size });
      },
      (position) => {
        this.applyWindowStateUpdate.execute({ type: 'SET_WINDOW_POSITION', position });
      },
    );
  }

  tearDownWindowIpc(): void {
    this.windowService.disposeIpcListeners();
  }
}
