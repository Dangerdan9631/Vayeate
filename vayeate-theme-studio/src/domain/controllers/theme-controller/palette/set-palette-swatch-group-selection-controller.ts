import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetPaletteSwatchGroupSelectionController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(refs: string[], checked: boolean): void {
    const state = this.themesStateGetter.current();
    const currentColor = state.checkedColorRefs;
    const nextSet = new Set(currentColor);
    for (const r of refs) {
      if (checked) nextSet.add(r);
      else nextSet.delete(r);
    }
    this.setThemePaneSelections.execute([...nextSet], state.checkedContrastRefs);
  }
}
