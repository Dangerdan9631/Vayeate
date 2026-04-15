import { singleton } from 'tsyringe';
import { UiStore } from '../../state/ui/ui-store';

@singleton()
export class CloseAllMenusOperation {
  constructor(private readonly uiStore: UiStore) {}

  execute(): void {
    this.uiStore.getStore().setAllMenusClosed();
  }
}
