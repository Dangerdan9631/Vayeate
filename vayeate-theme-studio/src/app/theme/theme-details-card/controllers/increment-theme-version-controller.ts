import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { nextPatchVersion } from '../../../../domain/utils/next-patch-version';
import { ClearPendingThemeSaveOperation } from '../../../../domain/operations/theme-operations/theme-details/clear-pending-theme-save-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SaveThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/save-theme-operation';
import { SetThemeSaveErrorOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-save-error-operation';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';

@singleton()
export class IncrementThemeVersionController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly saveTheme: SaveThemeOperation,
    private readonly setThemeSaveError: SetThemeSaveErrorOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly clearPendingThemeSave: ClearPendingThemeSaveOperation,
    private readonly themesStateGetter: ThemesStore,
  ) {}

  async run(): Promise<void> {
    const state = this.themesStateGetter.getStore().state;
    const theme = state.theme;
    if (!theme) return;
    const newVersion = nextPatchVersion(theme.version);
    const bumped: Theme = { ...theme, version: newVersion };
    this.clearPendingThemeSave.execute();
    this.setThemeHueAdjustment.execute(0);
    try {
      this.saveTheme.execute(bumped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setThemeSaveError.execute(message);
      return;
    }
    this.loadThemeRefs.execute();
    this.setSelectedThemeRef.execute({ name: theme.name, version: newVersion });
    const loaded = await this.loadTheme.execute(theme.name, newVersion);
    if (loaded) {
      this.setThemePaneSelections.execute(
        loaded.colorAssignments.map((a) => a.colorRef),
        loaded.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
  }
}





