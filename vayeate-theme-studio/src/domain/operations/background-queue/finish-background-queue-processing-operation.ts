import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';

@singleton()
export class FinishBackgroundQueueProcessingOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(): void {
    this.backgroundQueueStore.getStore().finishQueueProcessing();
  }
}
