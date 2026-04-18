import { singleton } from 'tsyringe';
import type { MenuId } from '../../state/ui/ui-state';
import { OpenMenuOperation } from '../../operations/app-operations/open-menu-operation';
import { UiStore } from '../../state/ui/ui-store';
import { CloseMenusOperation } from '../../operations/app-operations/close-menus-operation';

@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly uiStore: UiStore,
    private readonly openMenu: OpenMenuOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  async run(menuId: MenuId): Promise<void> {
    const openMenu = this.uiStore.getStore().state.openMenu;

    if (openMenu === menuId) {
      this.closeMenus.execute();
    } else {
      this.openMenu.execute(menuId);
    }
  }
}
