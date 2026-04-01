import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import type { ThemePreviewTokenRefField } from '../../../../model/schemas';
import { SetThemeOperation, SetThemeHueAdjustmentOperation, SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { applyHueShift } from '../../../utils/color';
import { SaveThemeController } from './save-theme-controller';

/** Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue. */
@singleton()
export class SetThemePreviewTokenRefController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  run(tokenRefField: ThemePreviewTokenRefField, value: string | null): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const next: Theme = { ...theme, [tokenRefField]: value };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
    const state = this.appStateGetter.current();
    const hueRef = state.themes.hueReferenceHex ?? '';
    const hueAdjustment = state.themes.hueAdjustment ?? 0;
    const nextRefHex = applyHueShift(hueRef, hueAdjustment / 100);
    this.setThemeHueReferenceHex.execute(nextRefHex);
    this.setThemeHueAdjustment.execute(0);
  }
}
