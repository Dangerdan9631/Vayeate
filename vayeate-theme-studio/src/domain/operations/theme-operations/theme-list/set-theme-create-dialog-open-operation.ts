import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

/**
 * Updates theme create dialog open in the domain or UI store.
 */

@singleton()
export class SetThemeCreateDialogOpenOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  /**
   * Runs the set theme create dialog open mutation.
   * @param value Value (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: boolean): void {
    this.themeCreateDialogStore.getStore().setOpen(value);
  }
}


