import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, groupNamesInUseFromTemplate, refreshRefsAndSelect } from './_helpers';

export async function removeGroup(
  setState: SetState,
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
  await refreshRefsAndSelect(setState, base.name, base.version);
}
