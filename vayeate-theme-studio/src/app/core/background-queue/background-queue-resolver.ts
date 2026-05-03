import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { BackgroundQueueType } from './background-queue-type';
import { ContinuationHandler } from './continuation-handler';

const noop = () => { };

export class BackgroundQueueResolver implements ContinuationHandler {
  private queue: BackgroundQueueType | undefined;
  private resolve: () => void = noop;

  constructor(private description: string) { }

  onResolve(currentQueueType: BackgroundQueueType, enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation): void {
    if (!this.queue || this.queue === currentQueueType) {
      this.resolve();
    } else {
      enqueueBackgroundQueue.execute(this.queue, this.description, this.resolve);
    }
  }

  onQueue(queue: BackgroundQueueType): ContinuationHandler {
    this.queue = queue;
    return this;
  }

  then(description: string, onResolve: () => void): void {
    this.description = description;
    this.resolve = onResolve;
  }
}
