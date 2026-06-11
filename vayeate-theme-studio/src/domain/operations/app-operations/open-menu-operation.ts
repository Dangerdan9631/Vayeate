import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';
import type { MenuId } from '../../../model/app-ui';

/**
 * Opens menu in the UI store.
 */


@singleton()
export class OpenMenuOperation {
  constructor(private readonly uiStore: UiStore) {}

  /**
   * Runs the open menu mutation.
   * @param menuId Menu id (MenuId).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(menuId: MenuId): void {
    this.uiStore.getStore().openMenu(menuId);
  }
}
