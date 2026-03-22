import { container, singleton } from 'tsyringe';
import { InitializeLogService, InitializeWindowService } from '../../operations/app-operations';

@singleton()
export class BootstrapAppController {
  constructor(private readonly initializeLogService: InitializeLogService) {}

  /** Early bootstrap from `main.tsx` (before React). */
  run(): void {
    this.initializeLogService.execute();
  }

  /**
   * After `WindowStateSetter` is registered in `AppProvider`.
   * Resolved lazily so `BootstrapAppController` can be constructed in `main.tsx` before React mounts
   * (otherwise tsyringe would try to build `InitializeWindowService` → `ApplyWindowStateUpdate` → missing `WindowStateSetter`).
   */
  runWindowIpcInit(): void {
    container.resolve(InitializeWindowService).execute();
  }

  disposeWindowIpc(): void {
    container.resolve(InitializeWindowService).tearDownWindowIpc();
  }
}
