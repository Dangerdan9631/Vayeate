import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../../model/schemas';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Toggle one variable (color or contrast) in selection; ref determines which set to update. */
@singleton()
export class ToggleVariableSelectionController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(checked: boolean, ref: ColorVariableKey | ContrastVariableKey): void {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    if (!theme) return;
    const colorSet = new Set(state.themes.checkedColorRefs);
    const contrastSet = new Set(state.themes.checkedContrastRefs);
    const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
    if (isColor) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
      this.setThemePaneSelections.execute([...colorSet], state.themes.checkedContrastRefs);
    } else {
      if (checked) contrastSet.add(ref);
      else contrastSet.delete(ref);
      this.setThemePaneSelections.execute(state.themes.checkedColorRefs, [...contrastSet]);
    }
  }
}
