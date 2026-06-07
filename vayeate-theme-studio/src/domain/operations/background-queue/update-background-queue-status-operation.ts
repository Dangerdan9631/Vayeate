import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import type { BackgroundQueueKey } from '../../../model/background-queue';

@singleton()
export class UpdateBackgroundQueueStatusOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(queueType: BackgroundQueueKey, descriptions: string[], queueLength: number): void {
    this.backgroundQueueStore.getStore().updateQueueStatus(queueType, descriptions, queueLength);
  }
}
