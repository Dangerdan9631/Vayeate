import { minimizeWindow as minimizeWindowOp } from '../../operations/window-operations';
import type { AppState } from '../../state/app-state';
import { createLogger } from '../../utils/logger';
import { canMinimizeWindow } from '../../validations/window-validations';

const log = createLogger('WindowController');

export type GetState = () => AppState;

export async function minimizeWindow(getState: GetState): Promise<void> {
  if (!canMinimizeWindow(getState)) {
    log.warn('minimizeWindow skipped: validation failed (window already minimized)');
    return;
  }
  await minimizeWindowOp();
}
