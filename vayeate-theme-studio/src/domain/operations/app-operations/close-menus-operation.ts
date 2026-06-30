import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';

/**
 * Closes menus in the UI store.
 */

@singleton()
export class CloseMenusOperation {
  constructor(private readonly uiStore: UiStore) {}

  /**
   * Runs the close menus mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.uiStore.getStore().closeMenus();
  }
}
