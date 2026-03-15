import type { ContrastVariable } from '../../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function addContrastVariable(
  setState: SetState,
  getState: GetState,
  key: string,
  groupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars: ContrastVariable[] = [
    ...base.contrastVariables,
    { key, comparisonSourceRef: null, groupRef: groupRef ?? null },
  ];
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
