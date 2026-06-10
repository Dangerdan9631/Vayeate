import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
} from '../../../model/background-queue';

export interface IBackgroundQueue {
  enqueue(
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation;
}
