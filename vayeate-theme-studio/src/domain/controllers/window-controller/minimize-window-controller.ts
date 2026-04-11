import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { ValidateCanMinimizeWindow } from '../../validations/window-validations';

@singleton()
export class MinimizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly validateCanMinimize: ValidateCanMinimizeWindow,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!this.validateCanMinimize.test()) {
      this.log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    await this.setWindowState.execute('minimize');
  }
}
