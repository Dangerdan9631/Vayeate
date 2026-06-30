import { singleton } from 'tsyringe';
import { ActionQueueUiStore } from '../../state/ui/action-queue-ui-store';

/**
 * Updates action queue status in the store.
 */

@singleton()
export class UpdateActionQueueStatusOperation {
  constructor(
    private readonly actionQueueStore: ActionQueueUiStore
  ) { }

  /**
   * Runs the update action queue status mutation.
   * @param queueLength Queue length (number).
   * @param currentActionDescription Current action description (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(queueLength: number, currentActionDescription: string): void {
    this.actionQueueStore.getStore().setQueueStatus(queueLength, currentActionDescription);
  }
}
