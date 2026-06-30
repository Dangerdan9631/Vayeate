import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates theme saturation adjustment in the UI store.
 */
@singleton()
export class SetThemeSaturationAdjustmentOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme saturation adjustment mutation.
   * @param value Input for this call.
   * @param options Preview update options.
   */
  execute(value: number, options?: { deferPreview?: boolean }): void {
    this.themeUiStore.getStore().setSaturationAdjustment(value, options);
  }
}
