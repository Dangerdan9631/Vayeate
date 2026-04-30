import { singleton } from 'tsyringe';
import type { TabId } from '../../../model/app-ui';
import { UiStore } from '../../state/ui/ui-store';

@singleton()
export class SetUiActiveTabOperation {
  constructor(private readonly uiStore: UiStore) {}

  execute(tabId: TabId): void {
    this.uiStore.getStore().setActiveTabId(tabId);
  }
}
