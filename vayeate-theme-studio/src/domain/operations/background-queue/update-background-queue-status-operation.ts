import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';
import { BackgroundQueueType } from '../../../app/core/background-queue/background-queue-type';

@singleton()
export class UpdateBackgroundQueueStatusOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(queueType: BackgroundQueueType, descriptions: string[], queueLength: number): void {
    this.backgroundQueueStore.getStore().updateQueueStatus(queueType, descriptions, queueLength);
  }
}
