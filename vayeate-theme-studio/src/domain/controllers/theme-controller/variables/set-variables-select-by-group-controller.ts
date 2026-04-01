import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

const UNGROUPED_KEY = '__ungrouped__';

@singleton()
export class SetVariablesSelectByGroupController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  async run(checked?: boolean, groupId?: string): Promise<void> {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    if (!theme?.templateRef || groupId == null) return;
    const template = await loadTemplateSnapshot(
      theme.templateRef.name,
      theme.templateRef.version,
    );
    if (!template) return;
    const g = groupId === '' ? UNGROUPED_KEY : groupId;
    const colorRefsInGroup = template.colorVariables
      .filter((v: { groupRef?: string | null; key: string }) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v: { key: string }) => v.key);
    const contrastRefsInGroup = template.contrastVariables
      .filter((v: { groupRef?: string | null; key: string }) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v: { key: string }) => v.key);
    const nextColor = new Set(state.themes.checkedColorRefs);
    const nextContrast = new Set(state.themes.checkedContrastRefs);
    colorRefsInGroup.forEach((r: string) => (checked ? nextColor.add(r) : nextColor.delete(r)));
    contrastRefsInGroup.forEach((r: string) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
    this.setThemePaneSelections.execute([...nextColor], [...nextContrast]);
  }
}
