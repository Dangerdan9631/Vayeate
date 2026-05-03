import { singleton } from 'tsyringe';
import { BackgroundQueueUiStore } from '../../state/ui/background-queue-ui-store';

@singleton()
export class UpdateBackgroundQueueStatusOperation {
  constructor(
    private readonly backgroundQueueStore: BackgroundQueueUiStore
  ) { }

  execute(args: { main?: { description: string, queueLength: number }, workers?: { descriptions: string[], queueLength: number } }): void {
    if (args.main) {
      this.backgroundQueueStore.getStore().updateMainQueueStatus(args.main.description, args.main.queueLength);
    }
    
    if (args.workers) {
      this.backgroundQueueStore.getStore().updateWorkerQueueStatus(args.workers.descriptions, args.workers.queueLength);
    }
  }
}
