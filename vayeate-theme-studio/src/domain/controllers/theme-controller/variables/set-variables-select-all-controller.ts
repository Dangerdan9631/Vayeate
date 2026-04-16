import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  async run(checked?: boolean): Promise<void> {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme) return;
    const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
    const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
    this.setThemePaneSelections.execute(nextColor, nextContrast);
  }
}


