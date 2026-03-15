import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, referencedColorVarKeysFromTemplate, refreshRefsAndSelect } from './_helpers';

export async function removeColorVariable(
  setState: SetState,
  getState: GetState,
  key: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const refs = referencedColorVarKeysFromTemplate(template);
  if (refs.has(key)) return;
  const base = getBaseForEdit(template);
  const newVars = base.colorVariables.filter((v) => v.key !== key);
  await saveTemplateOp({ ...base, colorVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
