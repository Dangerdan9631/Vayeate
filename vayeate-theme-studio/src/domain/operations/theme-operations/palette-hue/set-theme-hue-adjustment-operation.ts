import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates theme hue adjustment in the domain or UI store.
 */

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme hue adjustment mutation.
   * @param value Value (number).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: number, options?: { deferPreview?: boolean }): void {
    this.themeUiStore.getStore().setHueAdjustment(value, options);
  }
}


