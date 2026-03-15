import { toggleDevTools as toggleDevToolsOp } from '../../operations/window-operations';

export async function toggleDevTools(): Promise<void> {
  await toggleDevToolsOp();
}
