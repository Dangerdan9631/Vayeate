import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Set search filter text for the theme variables list.
 */
@singleton()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme variables search text mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.themeUiStore.getStore().setThemeVariablesSearchText(value);
  }
}


