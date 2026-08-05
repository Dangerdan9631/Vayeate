import { singleton } from 'tsyringe';
import type { MenuId } from '../../../../model/Common/app-ui';
import { OpenMenuOperation } from '../../../../domain/operations/Common/app-operations/open-menu-operation';
import { UiStore } from '../../../../domain/state/Common/ui/ui-store';
import { CloseMenusOperation } from '../../../../domain/operations/Common/app-operations/close-menus-operation';

/**
 * Opens or closes a header dropdown menu when its trigger is clicked.
 */
@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly uiStore: UiStore,
    private readonly openMenu: OpenMenuOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  /**
   * Toggles the requested menu open, or closes it when already active.
   * @param menuId Menu to open or close; must be a valid {@link MenuId}.
   */
  run(menuId: MenuId): void {
    const openMenu = this.uiStore.getStore().state.openMenu;

    if (openMenu === menuId) {
      this.closeMenus.execute();
    } else {
      this.openMenu.execute(menuId);
    }
  }
}
