import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import type { BackgroundQueueKey } from '../../../model/background-queue';

@singleton()
export class CompleteBackgroundQueueProcessingOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(queueType: BackgroundQueueKey): void {
    this.backgroundQueueStore.getStore().completeQueueProcessing(queueType);
  }
}
