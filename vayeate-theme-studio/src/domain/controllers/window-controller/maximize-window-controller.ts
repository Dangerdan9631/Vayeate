import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations/set-window-state-operation';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { ValidateCanMaximizeWindow } from '../../validations/window-validations/validate-can-maximize-window';

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

  async run(): Promise<void> {
    if (!this.validateCanMaximize.test()) {
      this.log.warn('maximizeWindow skipped: validation failed (window already maximized)');
      return;
    }
    await this.setWindowState.execute('maximize');
  }
}
