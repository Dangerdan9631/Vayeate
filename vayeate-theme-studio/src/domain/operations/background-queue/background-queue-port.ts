import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
} from '../../../model/background-queue';

export abstract class BackgroundQueuePort {
  abstract enqueue(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation;
}
