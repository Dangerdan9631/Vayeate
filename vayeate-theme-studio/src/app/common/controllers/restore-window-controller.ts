import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../domain/operations/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { ValidateCanRestoreWindow } from '../../../domain/validations/window-validations/validate-can-restore-window';

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

  run(): void {
    if (!this.validateCanRestore.test()) {
      this.log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    this.setWindowState.execute('restore');
  }
}
