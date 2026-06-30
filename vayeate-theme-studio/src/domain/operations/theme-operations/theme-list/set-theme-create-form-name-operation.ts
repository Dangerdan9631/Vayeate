import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

/**
 * Updates theme create form name in the domain or UI store.
 */

@singleton()
export class SetThemeCreateFormNameOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  /**
   * Runs the set theme create form name mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.themeCreateDialogStore.getStore().setName(value);
  }
}


