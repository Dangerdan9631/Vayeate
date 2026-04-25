import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';

@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(checked?: boolean): void {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme) return;
    const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
    const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
    this.setThemePaneSelections.execute(nextColor, nextContrast);
  }
}


