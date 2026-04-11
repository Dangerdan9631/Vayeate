import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { ValidateCanRestoreWindow } from '../../validations/window-validations';

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

  async run(): Promise<void> {
    if (!this.validateCanRestore.test()) {
      this.log.warn('restoreWindow skipped: validation failed (window not maximized or minimized)');
      return;
    }
    await this.setWindowState.execute('restore');
  }
}
