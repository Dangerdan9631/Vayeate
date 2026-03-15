const UNGROUPED_KEY = '__ungrouped__';

import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { loadTemplateSnapshot } from '../../operations/template-operations';

export async function setVariablesSelectByGroup(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
  groupId?: string,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef || groupId == null) return;
  const template = await loadTemplateSnapshot(
    theme.templateRef.name,
    theme.templateRef.version,
  );
  if (!template) return;
  const g = groupId === '' ? UNGROUPED_KEY : groupId;
  const colorRefsInGroup = template.colorVariables
    .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
    .map((v) => v.key);
  const contrastRefsInGroup = template.contrastVariables
    .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
    .map((v) => v.key);
  const nextColor = new Set(state.themes.checkedColorRefs);
  const nextContrast = new Set(state.themes.checkedContrastRefs);
  colorRefsInGroup.forEach((r) => (checked ? nextColor.add(r) : nextColor.delete(r)));
  contrastRefsInGroup.forEach((r) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
  setThemePaneSelectionsOp(setState, [...nextColor], [...nextContrast]);
}
