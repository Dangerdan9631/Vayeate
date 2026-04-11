import { singleton } from 'tsyringe';
import type { TabId } from '../../../model/tab-id';
import { UiStateSetter } from '../../state/ui/ui-state-reducer';

@singleton()
export class SetUiActiveTabOperation {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  execute(tabId: TabId): void {
    this.uiStateSetter.apply({ type: 'SET_UI_ACTIVE_TAB_ID', tabId });
  }
}
