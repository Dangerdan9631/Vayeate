import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates palette cluster by dark in the domain or UI store.
 */

@singleton()
export class SetPaletteClusterByDarkOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set palette cluster by dark mutation.
   * @param checked Checked (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(checked: boolean): void {
    this.themeUiStore.getStore().setPaletteClusterByDark(checked);
  }
}
