import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates theme hue reference hex in the domain or UI store.
 */

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme hue reference hex mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.themeUiStore.getStore().setHueReferenceHex(value);
  }
}


