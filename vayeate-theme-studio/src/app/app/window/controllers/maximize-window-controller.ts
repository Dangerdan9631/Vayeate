import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../../domain/operations/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../../../domain/utils/logger';
import { ValidateCanMaximizeWindow } from '../../../../domain/validations/window-validations/validate-can-maximize-window';

/**
 * Maximizes the main window when validation allows it.
 */
@singleton()
export class MaximizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly validateCanMaximize: ValidateCanMaximizeWindow,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  /**
   * Skips maximize when the window is already maximized.
   */
  run(): void {
    if (!this.validateCanMaximize.test()) {
      this.log.warn('maximizeWindow skipped: validation failed (window already maximized)');
      return;
    }
    this.setWindowState.execute('maximize');
  }
}
