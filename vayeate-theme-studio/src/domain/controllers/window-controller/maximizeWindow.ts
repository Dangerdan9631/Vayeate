import { singleton } from 'tsyringe';
import { SetWindowState } from '../../operations/window-operations';
import { AppStateGetter } from '../../state/app-state-getter';
import { createLogger } from '../../utils/logger';
import { canMaximizeWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

@singleton()
export class MaximizeWindowController {
  constructor(
    private readonly setWindowState: SetWindowState,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async run(): Promise<void> {
    if (!canMaximizeWindow(() => this.appStateGetter.current())) {
      log.warn('maximizeWindow skipped: validation failed (window already maximized)');
      return;
    }
    await this.setWindowState.execute('maximize');
  }
}
