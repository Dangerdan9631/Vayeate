import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';
import type { MenuId } from '../../../model/app-ui';


@singleton()
export class OpenMenuOperation {
  constructor(private readonly uiStore: UiStore) {}

  execute(menuId: MenuId): void {
    this.uiStore.getStore().openMenu(menuId);
  }
}
