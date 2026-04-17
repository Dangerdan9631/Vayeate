import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../../model/schema/primitives';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStore } from '../../../state/theme/themes-store';

/** Toggle one variable (color or contrast) in selection; ref determines which set to update. */
@singleton()
export class ToggleVariableSelectionController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  async run(checked: boolean, ref: ColorVariableKey | ContrastVariableKey): Promise<void> {
    const state = this.themesStateGetter.getStore().state;
    const theme = state.theme;
    if (!theme) return;
    const colorSet = new Set(state.checkedColorRefs);
    const contrastSet = new Set(state.checkedContrastRefs);
    const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
    if (isColor) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
      this.setThemePaneSelections.execute([...colorSet], state.checkedContrastRefs);
    } else {
      if (checked) contrastSet.add(ref);
      else contrastSet.delete(ref);
      this.setThemePaneSelections.execute(state.checkedColorRefs, [...contrastSet]);
    }
  }
}


