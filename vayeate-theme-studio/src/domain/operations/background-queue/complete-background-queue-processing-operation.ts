import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';

@singleton()
export class CompleteBackgroundQueueProcessingOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(queue: 'main' | 'worker'): void {
    if (queue === 'main') {
      this.backgroundQueueStore.getStore().completeMainQueueProcessing();
    } else {
      this.backgroundQueueStore.getStore().completeWorkerQueueProcessing();
    }
  }
}
