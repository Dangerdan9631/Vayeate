import { singleton } from 'tsyringe';
import { UiStateSetter } from '../../state/ui-state-setter';

export type MenuId = 'file' | 'edit' | 'history' | 'view';

@singleton()
export class SetMenuOpenState {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  execute(menuId: MenuId, isOpen: boolean): void {
    this.uiStateSetter.apply({ type: 'SET_UI_MENU_OPEN_STATE', menuId, isOpen });
  }
}
