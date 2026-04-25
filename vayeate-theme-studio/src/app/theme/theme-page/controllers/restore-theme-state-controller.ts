import { singleton } from 'tsyringe';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetSelectedThemeRefOperation } from '../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { SetThemeSaveErrorOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-save-error-operation';
import { SaveThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/save-theme-operation';
import { DeleteThemeOperation } from '../../../../domain/operations/theme-operations/theme-list/delete-theme-operation';
import { ClearPendingThemeSaveOperation } from '../../../../domain/operations/theme-operations/theme-details/clear-pending-theme-save-operation';
import { LoadThemeRefsOperation } from '../../../../domain/operations/theme-operations/theme-list/load-theme-refs-operation';
import type { RestoreThemeStateParams } from '../../../../domain/operations/theme-operations/types';

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

  run(params: RestoreThemeStateParams): void {
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
        this.saveTheme.execute(params.theme);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.setThemeSaveError.execute(message);
      }
      this.loadThemeRefs.execute();
    }
    if (params.deleteThemeVersionOnRestore) {
      this.deleteTheme.execute(
        params.deleteThemeVersionOnRestore.name,
        params.deleteThemeVersionOnRestore.version,
      );
      this.loadThemeRefs.execute();
    }
  }
}


