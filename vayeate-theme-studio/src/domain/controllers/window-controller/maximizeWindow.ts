import { maximizeWindow as maximizeWindowOp } from '../../operations/window-operations';
import type { AppState } from '../../state/app-state';
import { createLogger } from '../../utils/logger';
import { canMaximizeWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

export type GetState = () => AppState;

export async function maximizeWindow(getState: GetState): Promise<void> {
  if (!canMaximizeWindow(getState)) {
    log.warn('maximizeWindow skipped: validation failed (window already maximized)');
    return;
  }
  await maximizeWindowOp();
}
