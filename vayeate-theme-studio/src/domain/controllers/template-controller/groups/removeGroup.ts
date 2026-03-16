import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { getBaseForEdit, groupNamesInUseFromTemplate, refreshRefsAndSelect } from '../shared-flows';

export async function removeGroup(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  groupId: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const inUse = groupNamesInUseFromTemplate(template);
  if (inUse.has(groupId)) return;
  const base = getBaseForEdit(template);
  const newGroups = (base.groups ?? []).filter((g) => g !== groupId);
  await saveTemplateOp({ ...base, groups: newGroups });
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}


