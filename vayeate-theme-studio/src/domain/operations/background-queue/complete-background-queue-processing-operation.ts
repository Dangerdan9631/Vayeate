import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import { BackgroundQueueType } from '../../../app/core/background-queue/background-queue-type';

@singleton()
export class CompleteBackgroundQueueProcessingOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(queueType: BackgroundQueueType): void {
    this.backgroundQueueStore.getStore().completeQueueProcessing(queueType);
  }
}
