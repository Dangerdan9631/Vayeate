import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

const UNGROUPED_KEY = '__ungrouped__';

@singleton()
export class SetVariablesSelectByGroupController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
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
      .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v) => v.key);
    const contrastRefsInGroup = template.contrastVariables
      .filter((v) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v) => v.key);
    const nextColor = new Set(state.themes.checkedColorRefs);
    const nextContrast = new Set(state.themes.checkedContrastRefs);
    colorRefsInGroup.forEach((r) => (checked ? nextColor.add(r) : nextColor.delete(r)));
    contrastRefsInGroup.forEach((r) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
    this.setThemePaneSelections.execute([...nextColor], [...nextContrast]);
  }
}
