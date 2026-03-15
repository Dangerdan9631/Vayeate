import { maximizeWindow as maximizeWindowOp } from '../../operations/window-operations';

export async function maximizeWindow(): Promise<void> {
  await maximizeWindowOp();
}
