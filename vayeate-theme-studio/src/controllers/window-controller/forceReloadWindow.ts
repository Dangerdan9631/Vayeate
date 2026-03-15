import { reloadWindow as reloadWindowOp } from '../../operations/window-operations';

export async function forceReloadWindow(): Promise<void> {
  await reloadWindowOp(true);
}
