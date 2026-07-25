import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../../gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';

/**
 * Updates theme value adjustment in the UI store.
 */
@singleton()
export class SetThemeValueAdjustmentOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Runs the set theme value adjustment mutation.
   * @param value Input for this call.
   * @param options Preview update options.
   */
  execute(value: number, options?: { deferPreview?: boolean }): void {
    const store = this.themeUiStore.getStore();
    store.setValueAdjustment(value, options);
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
