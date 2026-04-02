import { singleton } from 'tsyringe';
import type { TabId } from '../../state/ui/ui-state';
import { UiStateSetter } from '../../state/ui/ui-state-reducer';

@singleton()
export class SetActiveTabController {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  run(tabId: TabId): void {
    this.uiStateSetter.apply({ type: 'SET_UI_ACTIVE_TAB_ID', tabId });
  }
}
