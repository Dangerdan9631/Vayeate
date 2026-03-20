import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  removeGroupFromTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { groupNamesInUseFromTemplate } from '../../../utils/template-utils';
import { refreshRefsAndSelect } from '../shared-flows';

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
  const base = bumpTemplateVersionForEdit(template);
  const next = removeGroupFromTemplate(base, groupId);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
