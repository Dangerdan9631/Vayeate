import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

const UNGROUPED_KEY = '__ungrouped__';

@singleton()
export class SetVariablesSelectByGroupController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
  ) {}

  async run(checked?: boolean, groupId?: string): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme?.templateRef || groupId == null) return;
    const template = await this.loadTemplateSnapshot.execute(
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
    const nextColor = new Set(state.checkedColorRefs);
    const nextContrast = new Set(state.checkedContrastRefs);
    colorRefsInGroup.forEach((r: string) => (checked ? nextColor.add(r) : nextColor.delete(r)));
    contrastRefsInGroup.forEach((r: string) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
    this.setThemePaneSelections.execute([...nextColor], [...nextContrast]);
  }
}


