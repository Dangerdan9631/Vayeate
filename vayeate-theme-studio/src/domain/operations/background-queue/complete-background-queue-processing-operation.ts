import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import type { BackgroundQueueKey } from '../../../model/background-queue';

/**
 * Marks background queue processing processing as finished in queue UI state.
 */

@singleton()
export class CompleteBackgroundQueueProcessingOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  /**
   * Runs the complete background queue processing mutation.
   * @param queueType Queue type (BackgroundQueueKey).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(queueType: BackgroundQueueKey): void {
    this.backgroundQueueStore.getStore().completeQueueProcessing(queueType);
  }
}
