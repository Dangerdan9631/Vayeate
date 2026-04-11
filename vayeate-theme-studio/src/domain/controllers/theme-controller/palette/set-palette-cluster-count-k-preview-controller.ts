import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Update cluster count in state only (slider drag; no persist). */
@singleton()
export class SetPaletteClusterCountKPreviewController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
  ) {}

  run(value: number): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const k = Math.max(1, Math.min(12, value));
    const next: Theme = { ...theme, paletteClusterCountK: k };
    this.setTheme.execute(next);
  }
}
