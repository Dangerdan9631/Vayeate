import { singleton } from 'tsyringe';
import type { MenuId } from '../../../../domain/state/ui/ui-state';
import { OpenMenuOperation } from '../../../../domain/operations/app-operations/open-menu-operation';
import { UiStore } from '../../../../domain/state/ui/ui-store';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly uiStore: UiStore,
    private readonly openMenu: OpenMenuOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(menuId: MenuId): void {
    const openMenu = this.uiStore.getStore().state.openMenu;

    if (openMenu === menuId) {
      this.closeMenus.execute();
    } else {
      this.openMenu.execute(menuId);
    }
  }
}
