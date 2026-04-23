import { singleton } from 'tsyringe';
import type { TabId } from '../../../../../domain/state/ui/ui-state';
import { SetUiActiveTabOperation } from '../../../../../domain/operations/app-operations/set-ui-active-tab-operation';

@singleton()
export class SetActiveTabController {
  constructor(private readonly setUiActiveTab: SetUiActiveTabOperation) {}

  run(tabId: TabId): void {
    this.setUiActiveTab.execute(tabId);
  }
}
