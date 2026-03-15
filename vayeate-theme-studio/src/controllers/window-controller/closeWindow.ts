import { closeWindow as closeWindowOp } from '../../operations/window-operations';

export async function closeWindow(): Promise<void> {
  await closeWindowOp();
}
