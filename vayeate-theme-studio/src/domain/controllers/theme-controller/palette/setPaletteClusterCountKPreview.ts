import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';

/** Update cluster count in state only (slider drag; no persist). */
@singleton()
export class SetPaletteClusterCountKPreviewController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
  ) {}

  run(value: number): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const k = Math.max(1, Math.min(12, value));
    const next: Theme = { ...theme, paletteClusterCountK: k };
    this.setTheme.execute(next);
  }
}
