import { EnqueueBackgroundQueueActionOperation } from '../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../model/background-queue';

const noop = () => { };

/**
 * Resolves a completed background job and optionally re-enqueues follow-up work on another queue.
 */
export class BackgroundQueueResolver implements BackgroundQueueContinuation {
  private queue: BackgroundQueueKey | undefined;
  private resolve: () => void = noop;

  constructor(private description: string) { }

  onResolve(currentQueueType: BackgroundQueueKey, enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation): void {
    if (!this.queue || this.queue === currentQueueType) {
      this.resolve();
    } else {
      enqueueBackgroundQueue.execute(this.queue, this.description, this.resolve);
    }
  }

  onQueue(queue: BackgroundQueueKey): BackgroundQueueContinuation {
    this.queue = queue;
    return this;
  }

  then(description: string, onResolve: () => void): void {
    this.description = description;
    this.resolve = onResolve;
  }
}
