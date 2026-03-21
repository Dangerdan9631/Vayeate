import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

@singleton()
export class SetVariablesSelectByTypeController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
  ) {}

  run(checked?: boolean, variableType?: string): void {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    if (!theme) return;
    const colorRefs = state.themes.checkedColorRefs;
    const contrastRefs = state.themes.checkedContrastRefs;
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
