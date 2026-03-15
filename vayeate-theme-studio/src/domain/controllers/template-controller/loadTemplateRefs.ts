import type { SetStoreState } from '../../state/store-state-reducer';
import { loadTemplateRefs as loadTemplateRefsOp, type SetState } from '../../operations/template-operations';

export async function loadTemplateRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadTemplateRefsOp(setState, setStoreState);
}
