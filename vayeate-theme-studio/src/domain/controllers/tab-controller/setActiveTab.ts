import { singleton } from 'tsyringe';
import type { TabId } from '../../state/tab-id';
import { UiStateSetter } from '../../state/ui-state-setter';

@singleton()
export class SetActiveTabController {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  run(tabId: TabId): void {
    this.uiStateSetter.apply({ type: 'SET_UI_ACTIVE_TAB_ID', tabId });
  }
}
