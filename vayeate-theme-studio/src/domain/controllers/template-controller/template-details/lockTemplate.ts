import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  lockTemplateEntity,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { canLockTemplate } from '../../../validations/template-validations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function lockTemplate(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
): Promise<void> {
  const template = getState().templates.template;
  if (!canLockTemplate(template)) return;
  const updated = lockTemplateEntity(template);
  await saveTemplateOp(updated);
  await refreshRefsAndSelect(setState, setStoreState, template.name, template.version);
}
