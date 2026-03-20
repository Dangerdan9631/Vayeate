import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  addColorVariableToTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function addColorVariable(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  key: string,
  groupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  const next = addColorVariableToTemplate(base, key, groupRef);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
