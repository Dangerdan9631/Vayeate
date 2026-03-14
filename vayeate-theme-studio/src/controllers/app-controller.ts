import type { SetState } from '../operations/app-operations';
import {
  loadApplication as loadApplicationOp,
  unloadApplication as unloadApplicationOp,
} from '../operations/app-operations';

export async function loadApplication(setState: SetState): Promise<void> {
  await loadApplicationOp(setState);
}

export async function unloadApplication(setState: SetState): Promise<void> {
  await unloadApplicationOp(setState);
}
