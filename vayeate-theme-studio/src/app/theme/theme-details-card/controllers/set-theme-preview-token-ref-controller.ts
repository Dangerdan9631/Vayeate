import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import type { ThemePreviewTokenRefField } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { applyHueShift } from '../../../../domain/utils/color-hsl';

/** Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue. */
@singleton()
export class SetThemePreviewTokenRefController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  run(tokenRefField: ThemePreviewTokenRefField, value: string | null): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;
    const next: Theme = { ...theme, [tokenRefField]: value };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
    const themeState = this.themeUiStore.getStore().state;
    const hueRef = themeState.hueReferenceHex ?? '';
    const hueAdjustment = themeState.hueAdjustment ?? 0;
    const nextRefHex = applyHueShift(hueRef, hueAdjustment / 100);
    this.setThemeHueReferenceHex.execute(nextRefHex);
    this.setThemeHueAdjustment.execute(0);
  }
}


