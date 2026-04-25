import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';

@singleton()
export class SetVariablesSelectByTypeController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(checked?: boolean, variableType?: string): void {
    const state = this.themesStateGetter.getStore().state;
    const theme = state.theme;
    if (!theme) return;
    const colorRefs = state.checkedColorRefs;
    const contrastRefs = state.checkedContrastRefs;
    let nextColor = [...colorRefs];
    let nextContrast = [...contrastRefs];
    if (variableType === 'color') {
      nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
    } else if (variableType === 'contrast') {
      nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
    }
    this.setThemePaneSelections.execute(nextColor, nextContrast);
  }
}


