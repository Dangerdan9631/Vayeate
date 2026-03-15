import { minimizeWindow as minimizeWindowOp } from '../../operations/window-operations';

export async function minimizeWindow(): Promise<void> {
  await minimizeWindowOp();
}
