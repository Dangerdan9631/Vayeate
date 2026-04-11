import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Applies checked state to many color variable refs in one state update (single user gesture). */
@singleton()
export class SetColorRefsSelectionBatchController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  async run(refs: readonly string[], checked: boolean): Promise<void> {
    const state = this.themesStateGetter.current();
    if (!state.theme || refs.length === 0) return;
    const colorSet = new Set(state.checkedColorRefs);
    for (const ref of refs) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
    }
    this.setThemePaneSelections.execute([...colorSet], state.checkedContrastRefs);
  }
}
