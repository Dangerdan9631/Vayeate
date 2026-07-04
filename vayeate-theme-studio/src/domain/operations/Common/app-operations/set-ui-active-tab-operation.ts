import { singleton } from 'tsyringe';
import type { TabId } from '../../../../model/Common/app-ui';
import { UiStore } from '../../../state/Common/ui/ui-store';

/**
 * Updates ui active tab in the domain or UI store.
 */

@singleton()
export class SetUiActiveTabOperation {
  constructor(private readonly uiStore: UiStore) {}

  /**
   * Runs the set ui active tab mutation.
   * @param tabId Tab id (TabId).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(tabId: TabId): void {
    this.uiStore.getStore().setActiveTabId(tabId);
  }
}
