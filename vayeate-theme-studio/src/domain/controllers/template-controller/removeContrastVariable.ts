import type { SetStoreState } from '../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import {
  getBaseForEdit,
  referencedContrastVarKeysFromTemplate,
  refreshRefsAndSelect,
} from './_helpers';

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
  const base = getBaseForEdit(template);
  const newVars = base.contrastVariables.filter((v) => v.key !== key);
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}
