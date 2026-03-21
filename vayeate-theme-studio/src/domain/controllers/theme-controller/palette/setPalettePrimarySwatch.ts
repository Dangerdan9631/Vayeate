import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Set selection to a single ref (primary swatch click). */
@singleton()
export class SetPalettePrimarySwatchController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
  ) {}

  run(ref: string | undefined): void {
    if (ref == null) return;
    const state = this.appStateGetter.current();
    this.setThemePaneSelections.execute([ref], state.themes.checkedContrastRefs);
  }
}
