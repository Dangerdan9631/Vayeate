import { singleton } from 'tsyringe';
import { ActionQueueUiStore } from '../../state/ui/action-queue-ui-store';

@singleton()
export class UpdateActionQueueStatusOperation {
  constructor(
    private readonly actionQueueStore: ActionQueueUiStore
  ) { }

  execute(queueLength: number, currentActionDescription: string): void {
    this.actionQueueStore.getStore().setQueueStatus(queueLength, currentActionDescription);
  }
}
