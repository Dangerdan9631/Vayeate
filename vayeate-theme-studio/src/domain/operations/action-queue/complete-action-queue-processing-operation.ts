import { singleton } from 'tsyringe';
import { ActionQueueUiStore } from '../../state/ui/action-queue-ui-store';

/**
 * Marks action queue processing processing as finished in queue UI state.
 */

@singleton()
export class CompleteActionQueueProcessingOperation {
  constructor(
    private readonly actionQueueStore: ActionQueueUiStore
  ) { }

  /**
   * Runs the complete action queue processing mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.actionQueueStore.getStore().completeQueueProcessing();
  }
}
