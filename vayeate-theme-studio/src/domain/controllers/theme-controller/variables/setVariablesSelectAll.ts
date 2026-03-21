import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
  ) {}

  run(checked?: boolean): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
    const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
    this.setThemePaneSelections.execute(nextColor, nextContrast);
  }
}
