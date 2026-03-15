import type { SetStoreState } from '../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function updateVariableGroupRef(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  variableKey: string,
  groupRef: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const colorIdx = base.colorVariables.findIndex((v) => v.key === variableKey);
  if (colorIdx >= 0) {
    const newVars = base.colorVariables.map((v) =>
      v.key === variableKey ? { ...v, groupRef } : v,
    );
    await saveTemplateOp({ ...base, colorVariables: newVars });
  } else {
    const newVars = base.contrastVariables.map((v) =>
      v.key === variableKey ? { ...v, groupRef } : v,
    );
    await saveTemplateOp({ ...base, contrastVariables: newVars });
  }
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}
