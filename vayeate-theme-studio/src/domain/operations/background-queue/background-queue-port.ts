import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../model/background-queue';

export abstract class BackgroundQueuePort {
  abstract enqueue(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
  ): BackgroundQueueContinuation;
}
