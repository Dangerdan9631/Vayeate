import { singleton } from 'tsyringe';
import type { TabId } from '../../state/ui/ui-state';
import { SetUiActiveTabOperation } from '../../operations/app-operations/set-ui-active-tab-operation';

@singleton()
export class SetActiveTabController {
  constructor(private readonly setUiActiveTab: SetUiActiveTabOperation) {}

  async run(tabId: TabId): Promise<void> {
    this.setUiActiveTab.execute(tabId);
  }
}
