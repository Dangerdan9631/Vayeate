import type { SetState } from '../../operations/app-operations';
import type { GetState } from '../../operations/undo-operations';
import { performRedo as performRedoOp } from '../../operations/undo-operations';

export async function performRedo(setState: SetState, getState: GetState): Promise<void> {
  await performRedoOp(setState, getState);
}
