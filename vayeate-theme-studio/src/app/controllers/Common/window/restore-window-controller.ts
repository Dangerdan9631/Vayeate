import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../../domain/operations/Common/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../../../domain/utils/Common/logger';
import { ValidateCanRestoreWindow } from '../../../../domain/validations/Common/window-validations/validate-can-restore-window';

/**
 * Restores the main window from maximized or minimized state when allowed.
 */
@singleton()
export class RestoreWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly validateCanRestore: ValidateCanRestoreWindow,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  /**
   * Skips restore when the window is neither maximized nor minimized.
   */
  run(): void {
    if (!this.validateCanRestore.test()) {
      this.log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    this.setWindowState.execute('restore');
  }
}
