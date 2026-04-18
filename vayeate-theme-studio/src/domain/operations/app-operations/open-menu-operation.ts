import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';
import { MenuId } from '../../state/ui/ui-state';


@singleton()
export class OpenMenuOperation {
  constructor(private readonly uiStore: UiStore) {}

  execute(menuId: MenuId): void {
    this.uiStore.getStore().openMenu(menuId);
  }
}
