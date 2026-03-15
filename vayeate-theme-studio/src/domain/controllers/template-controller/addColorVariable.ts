import type { ColorVariable } from '../../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function addColorVariable(
  setState: SetState,
  getState: GetState,
  key: string,
  groupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars: ColorVariable[] = [
    ...base.colorVariables,
    { key, groupRef: groupRef ?? null },
  ];
  await saveTemplateOp({ ...base, colorVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
