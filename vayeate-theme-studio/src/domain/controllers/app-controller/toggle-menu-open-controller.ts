import { singleton } from 'tsyringe';
import type { MenuId } from '../../operations/app-operations/set-menu-open-state-operation';
import { SetMenuOpenStateOperation } from '../../operations/app-operations/set-menu-open-state-operation';
import { UiStore } from '../../state/ui/ui-store';

@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly uiStore: UiStore,
    private readonly setMenuOpenState: SetMenuOpenStateOperation,
  ) {}

  async run(menuId: MenuId): Promise<void> {
    const ui = this.uiStore.getStore().state;
    const keyByMenuId = {
      file: 'fileOpen',
      edit: 'editOpen',
      history: 'historyOpen',
      view: 'viewOpen',
    } as const;
    const key = keyByMenuId[menuId];
    this.setMenuOpenState.execute(menuId, !ui.menuOpen[key]);
  }
}
