import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetVariablesSelectByTypeController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(checked?: boolean, variableType?: string): void {
    const state = this.themesStateGetter.current();
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
