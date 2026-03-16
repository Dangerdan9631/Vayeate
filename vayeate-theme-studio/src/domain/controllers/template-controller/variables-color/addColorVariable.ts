import type { ColorVariable } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from '../shared-flows';

export async function addColorVariable(
  setState: SetState,
  setStoreState: SetStoreState,
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
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}



