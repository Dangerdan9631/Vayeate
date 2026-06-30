import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

/**
 * Updates theme is creating in the domain or UI store.
 */

@singleton()
export class SetThemeIsCreatingOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  /**
   * Runs the set theme is creating mutation.
   * @param value Value (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: boolean): void {
    this.themeCreateDialogStore.getStore().setIsCreating(value);
  }
}


