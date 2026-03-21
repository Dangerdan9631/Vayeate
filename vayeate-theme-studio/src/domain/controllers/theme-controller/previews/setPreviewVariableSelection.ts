import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Set pane selection to the single variable ref (THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT). */
@singleton()
export class SetPreviewVariableSelectionController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
  ) {}

  run(value: string): void {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
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
