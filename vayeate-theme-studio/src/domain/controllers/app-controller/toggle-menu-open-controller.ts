import { singleton } from 'tsyringe';
import { UiStateGetter } from '../../state/ui/ui-state-reducer';
import type { MenuId } from '../../operations/app-operations/set-menu-open-state-operation';
import { SetMenuOpenStateOperation } from '../../operations/app-operations/set-menu-open-state-operation';

@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly setMenuOpenState: SetMenuOpenStateOperation,
  ) {}

  run(menuId: MenuId): void {
    const ui = this.uiStateGetter.current();
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
