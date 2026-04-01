import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../state/app-state-getter';
import { type MenuId, SetMenuOpenStateOperation } from '../../operations/app-operations';

@singleton()
export class ToggleMenuOpenController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setMenuOpenState: SetMenuOpenStateOperation,
  ) {}

  run(menuId: MenuId): void {
    const state = this.appStateGetter.current();
    const keyByMenuId = {
      file: 'fileOpen',
      edit: 'editOpen',
      history: 'historyOpen',
      view: 'viewOpen',
    } as const;
    const key = keyByMenuId[menuId];
    this.setMenuOpenState.execute(menuId, !state.ui.menuOpen[key]);
  }
}
