import { reloadWindow as reloadWindowOp } from '../../operations/window-operations';

export async function reloadWindow(): Promise<void> {
  await reloadWindowOp(false);
}
