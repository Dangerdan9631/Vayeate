import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import type { ThemePreviewTokenRefField } from '../../../../model/schemas';
import { SetThemeOperation, SetThemeHueAdjustmentOperation, SetThemeHueReferenceHexOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { applyHueShift } from '../../../utils/color';
import { SaveThemeController } from './save-theme-controller';

/** Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue. */
@singleton()
export class SetThemePreviewTokenRefController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  run(tokenRefField: ThemePreviewTokenRefField, value: string | null): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const next: Theme = { ...theme, [tokenRefField]: value };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
    const themeState = this.themesStateGetter.current();
    const hueRef = themeState.hueReferenceHex ?? '';
    const hueAdjustment = themeState.hueAdjustment ?? 0;
    const nextRefHex = applyHueShift(hueRef, hueAdjustment / 100);
    this.setThemeHueReferenceHex.execute(nextRefHex);
    this.setThemeHueAdjustment.execute(0);
  }
}
