import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations';
import { WindowStateGetter } from '../../state/window/window-state-reducer';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { canMaximizeWindow } from '../../validations/window-validations';

@singleton()
export class MaximizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly windowStateGetter: WindowStateGetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!canMaximizeWindow(() => this.windowStateGetter.current())) {
      this.log.warn('maximizeWindow skipped: validation failed (window already maximized)');
      return;
    }
    await this.setWindowState.execute('maximize');
  }
}
