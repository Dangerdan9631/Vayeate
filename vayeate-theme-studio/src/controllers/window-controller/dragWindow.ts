import { dragWindow as dragWindowOp } from '../../operations/window-operations';

export async function dragWindow(): Promise<void> {
  await dragWindowOp();
}
