import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from '../shared-flows';

export async function addGroup(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  name: string,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  const existing = template.groups ?? [];
  if (existing.includes(trimmed)) return;
  const base = getBaseForEdit(template);
  const newGroups = [...(base.groups ?? []), trimmed];
  await saveTemplateOp({ ...base, groups: newGroups });
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}


