import type { SetState } from '../../operations/app-operations';
import type { GetState } from '../../operations/undo-operations';
import { performHistoryGoTo as performHistoryGoToOp } from '../../operations/undo-operations';

export async function performHistoryGoTo(
  setState: SetState,
  getState: GetState,
  frameId: string,
): Promise<void> {
  await performHistoryGoToOp(setState, getState, frameId);
}
