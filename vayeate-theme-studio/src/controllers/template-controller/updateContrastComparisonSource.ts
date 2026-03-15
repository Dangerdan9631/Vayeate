import type { ColorVariableKey } from '../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function updateContrastComparisonSource(
  setState: SetState,
  getState: GetState,
  contrastVariableKey: string,
  comparisonSourceRef: ColorVariableKey | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const newVars = base.contrastVariables.map((v) =>
    v.key === contrastVariableKey ? { ...v, comparisonSourceRef } : v,
  );
  await saveTemplateOp({ ...base, contrastVariables: newVars });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
