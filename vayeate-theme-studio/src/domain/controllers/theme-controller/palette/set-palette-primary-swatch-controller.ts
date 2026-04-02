import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Set selection to a single ref (primary swatch click). */
@singleton()
export class SetPalettePrimarySwatchController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(ref: string | undefined): void {
    if (ref == null) return;
    const state = this.themesStateGetter.current();
    this.setThemePaneSelections.execute([ref], state.checkedContrastRefs);
  }
}
