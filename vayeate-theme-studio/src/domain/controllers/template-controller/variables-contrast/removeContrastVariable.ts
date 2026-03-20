import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  removeContrastVariableFromTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { referencedContrastVarKeysFromTemplate } from '../../../utils/template-utils';
import { refreshRefsAndSelect } from '../shared-flows';

export async function removeContrastVariable(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  key: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const refs = referencedContrastVarKeysFromTemplate(template);
  if (refs.has(key)) return;
  const base = bumpTemplateVersionForEdit(template);
  const next = removeContrastVariableFromTemplate(base, key);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
