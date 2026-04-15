import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';

export type MenuId = 'file' | 'edit' | 'history' | 'view';

@singleton()
export class SetMenuOpenStateOperation {
  constructor(private readonly uiStore: UiStore) {}

  execute(menuId: MenuId, isOpen: boolean): void {
    this.uiStore.getStore().setMenuOpenState(menuId, isOpen);
  }
}
