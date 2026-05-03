import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

/** Update cluster count in state only (slider drag; no persist). */
@singleton()
export class SetPaletteClusterCountKPreviewController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
  ) {}

  run(value: number): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;
    const k = Math.max(1, Math.min(12, value));
    const next: Theme = { ...theme, paletteClusterCountK: k };
    this.setTheme.execute(next);
  }
}


