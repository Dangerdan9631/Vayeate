import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../../gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';

/**
 * Updates theme hue adjustment in the domain or UI store.
 */

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Runs the set theme hue adjustment mutation.
   * @param value Value (number).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: number, options?: { deferPreview?: boolean }): void {
    const store = this.themeUiStore.getStore();
    store.setHueAdjustment(value, options);
    if (options?.deferPreview) {
      return;
    }

    const { theme, panePreviewColorAssignments } = store.state;
    if (!theme) {
      return;
    }

    this.debouncedThemePersist.schedulePreviewRefresh({
      ...theme,
      colorAssignments: panePreviewColorAssignments,
    });
  }
}


