import { singleton } from 'tsyringe';
import type { ThemeCreateDialogMode } from '../../../state/ui/theme-create-dialog-state';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

/**
 * Updates theme create dialog mode in the domain or UI store.
 */
@singleton()
export class SetThemeCreateDialogModeOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  /**
   * Runs the set theme create dialog mode mutation.
   * @param value Value (ThemeCreateDialogMode).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */
  execute(value: ThemeCreateDialogMode): void {
    this.themeCreateDialogStore.getStore().setMode(value);
  }
}
