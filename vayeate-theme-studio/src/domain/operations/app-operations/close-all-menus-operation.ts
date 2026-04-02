import { singleton } from 'tsyringe';
import { UiStateSetter } from '../../state/ui/ui-state-reducer';

@singleton()
export class CloseAllMenusOperation {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  execute(): void {
    this.uiStateSetter.apply({ type: 'SET_UI_ALL_MENUS_CLOSED' });
  }
}
