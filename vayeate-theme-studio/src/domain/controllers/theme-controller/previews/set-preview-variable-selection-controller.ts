import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Set pane selection to the single variable ref (THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT). */
@singleton()
export class SetPreviewVariableSelectionController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(value: string): void {
    const state = this.themesStateGetter.current();
    const theme = state.theme;
    if (!theme?.templateRef || !value) return;
    const isColorRef = theme.colorAssignments.some((a) => a.colorRef === value);
    const isContrastRef = theme.contrastAssignments.some((a) => a.contrastVariableRef === value);
    if (isColorRef) {
      this.setThemePaneSelections.execute([value], []);
    } else if (isContrastRef) {
      this.setThemePaneSelections.execute([], [value]);
    }
  }
}
