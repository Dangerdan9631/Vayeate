import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

@singleton()
export class SetPaletteSwatchGroupSelectionController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemePaneSelections: SetThemePaneSelections,
  ) {}

  run(refs: string[], checked: boolean): void {
    const state = this.appStateGetter.current();
    const currentColor = state.themes.checkedColorRefs;
    const nextSet = new Set(currentColor);
    for (const r of refs) {
      if (checked) nextSet.add(r);
      else nextSet.delete(r);
    }
    this.setThemePaneSelections.execute([...nextSet], state.themes.checkedContrastRefs);
  }
}
