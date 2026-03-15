import { restoreWindow as restoreWindowOp } from '../../operations/window-operations';

export async function restoreWindow(): Promise<void> {
  await restoreWindowOp();
}
