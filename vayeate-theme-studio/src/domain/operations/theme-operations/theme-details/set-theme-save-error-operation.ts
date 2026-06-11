import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates theme save error in the domain or UI store.
 */

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme save error mutation.
   * @param error Error (string | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(error: string | null): void {
    this.themeUiStore.getStore().setSaveError(error);
  }
}


