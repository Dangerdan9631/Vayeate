import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../operations/window-operations';
import { WindowStateGetter } from '../../state/window/window-state-reducer';
import { LoggerFactory, type Logger } from '../../utils/logger';
import { canMinimizeWindow } from '../../validations/window-validations';

@singleton()
export class MinimizeWindowController {
  private readonly log: Logger;

  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly windowStateGetter: WindowStateGetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('WindowController');
  }

  async run(): Promise<void> {
    if (!canMinimizeWindow(() => this.windowStateGetter.current())) {
      this.log.warn('minimizeWindow skipped: validation failed (window already minimized)');
      return;
    }
    await this.setWindowState.execute('minimize');
  }
}
