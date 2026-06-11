import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import type { BackgroundQueueKey } from '../../../model/background-queue';

/**
 * Updates background queue status in the store.
 */

@singleton()
export class UpdateBackgroundQueueStatusOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  /**
   * Runs the update background queue status mutation.
   * @param queueType Queue type (BackgroundQueueKey).
   * @param descriptions Descriptions (string[]).
   * @param queueLength Queue length (number).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(queueType: BackgroundQueueKey, descriptions: string[], queueLength: number): void {
    this.backgroundQueueStore.getStore().updateQueueStatus(queueType, descriptions, queueLength);
  }
}
