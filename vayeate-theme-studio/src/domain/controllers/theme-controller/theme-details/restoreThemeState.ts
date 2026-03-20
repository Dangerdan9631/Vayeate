import { singleton } from 'tsyringe';
import {
  SetTheme,
  SetThemePaneSelections,
  SetSelectedThemeRef,
  SetThemeHueAdjustment,
  SetThemeHueReferenceHex,
  SetThemeSaveError,
  SaveTheme,
  DeleteTheme,
  LoadThemeRefs,
  type RestoreThemeStateParams,
} from '../../../operations/theme-operations';
import { clearPendingSave } from '../theme-list/theme-save-state';

@singleton()
export class RestoreThemeStateController {
  constructor(
    private readonly setTheme: SetTheme,
    private readonly setThemePaneSelections: SetThemePaneSelections,
    private readonly setSelectedThemeRef: SetSelectedThemeRef,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustment,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHex,
    private readonly setThemeSaveError: SetThemeSaveError,
    private readonly saveTheme: SaveTheme,
    private readonly deleteTheme: DeleteTheme,
    private readonly loadThemeRefs: LoadThemeRefs,
  ) {}

  async run(params: RestoreThemeStateParams): Promise<void> {
    if (params.theme !== undefined && params.theme !== null) {
      clearPendingSave();
    }
    if (params.theme !== undefined) {
      this.setTheme.execute(params.theme);
    }
    if (
      params.checkedColorRefs !== undefined &&
      params.checkedContrastRefs !== undefined
    ) {
      this.setThemePaneSelections.execute(params.checkedColorRefs, params.checkedContrastRefs);
    }
    if (params.theme !== undefined && params.theme !== null) {
      this.setSelectedThemeRef.execute({
        name: params.theme.name,
        version: params.theme.version,
      });
    }
    if (params.hueAdjustment !== undefined) {
      this.setThemeHueAdjustment.execute(params.hueAdjustment);
    }
    if (params.hueReferenceHex !== undefined) {
      this.setThemeHueReferenceHex.execute(params.hueReferenceHex);
    }
    if (params.theme !== undefined && params.theme !== null) {
      this.setThemeSaveError.execute(null);
      try {
        await this.saveTheme.execute(params.theme);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.setThemeSaveError.execute(message);
      }
      await this.loadThemeRefs.execute();
    }
    if (params.deleteThemeVersionOnRestore) {
      await this.deleteTheme.execute(
        params.deleteThemeVersionOnRestore.name,
        params.deleteThemeVersionOnRestore.version,
      );
      await this.loadThemeRefs.execute();
    }
  }
}


