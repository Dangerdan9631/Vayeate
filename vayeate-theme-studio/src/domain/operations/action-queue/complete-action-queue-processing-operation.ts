import { singleton } from 'tsyringe';
import { ActionQueueUiStore } from '../../state/ui/action-queue-ui-store';

@singleton()
export class CompleteActionQueueProcessingOperation {
  constructor(
    private readonly actionQueueStore: ActionQueueUiStore
  ) { }

  execute(): void {
    this.actionQueueStore.getStore().completeQueueProcessing();
  }
}
