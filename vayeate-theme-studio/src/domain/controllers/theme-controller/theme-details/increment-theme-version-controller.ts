import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';
import {
  SetSelectedThemeRefOperation,
  SetThemeHueAdjustmentOperation,
  SaveThemeOperation,
  SetThemeSaveErrorOperation,
  LoadThemeRefsOperation,
  SetThemePaneSelectionsOperation,
  LoadThemeOperation,
} from '../../../operations/theme-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { clearPendingSave } from '../theme-list/theme-save-state';
import { themeStackId } from '../../../utils/stack-id';

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
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async run(): Promise<void> {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    if (!theme) return;
    const newVersion = nextPatchVersion(theme.version);
    const bumped: Theme = { ...theme, version: newVersion };
    clearPendingSave();
    this.setThemeHueAdjustment.execute(0);
    try {
      await this.saveTheme.execute(bumped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setThemeSaveError.execute(message);
      return;
    }
    await this.loadThemeRefs.execute();
    this.setSelectedThemeRef.execute({ name: theme.name, version: newVersion });
    const loaded = await this.loadTheme.execute(theme.name, newVersion);
    if (loaded) {
      this.setThemePaneSelections.execute(
        loaded.colorAssignments.map((a) => a.colorRef),
        loaded.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
    this.setCurrentUndoStackId.execute(themeStackId(theme.name, newVersion));
  }
}



