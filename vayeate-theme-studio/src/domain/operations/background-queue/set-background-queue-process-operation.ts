import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';

@singleton()
export class SetBackgroundQueueProcessOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(description: string, queueLength: number): void {
    this.backgroundQueueStore.getStore().setQueueProcess(description, queueLength);
  }
}
