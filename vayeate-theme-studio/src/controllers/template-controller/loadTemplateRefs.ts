import { loadTemplateRefs as loadTemplateRefsOp, type SetState } from '../../operations/template-operations';

export async function loadTemplateRefs(setState: SetState): Promise<void> {
  await loadTemplateRefsOp(setState);
}
