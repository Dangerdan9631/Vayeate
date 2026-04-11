import { singleton } from 'tsyringe';
import {
  SetThemeOperation,
  SetThemePaneSelectionsOperation,
  SetSelectedThemeRefOperation,
  SetThemeHueAdjustmentOperation,
  SetThemeHueReferenceHexOperation,
  SetThemeSaveErrorOperation,
  SaveThemeOperation,
  DeleteThemeOperation,
  ClearPendingThemeSaveOperation,
  LoadThemeRefsOperation,
  type RestoreThemeStateParams,
} from '../../../operations/theme-operations';

@singleton()
export class RestoreThemeStateController {
  constructor(
    private readonly setTheme: SetThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeSaveError: SetThemeSaveErrorOperation,
    private readonly saveTheme: SaveThemeOperation,
    private readonly deleteTheme: DeleteThemeOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly clearPendingThemeSave: ClearPendingThemeSaveOperation,
  ) {}

  async run(params: RestoreThemeStateParams): Promise<void> {
    if (params.theme !== undefined && params.theme !== null) {
      this.clearPendingThemeSave.execute();
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


