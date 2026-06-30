import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
} from '../../../model/background-queue';

/**
 * Abstraction for background queue consumed by domain operations.
 */

export abstract class BackgroundQueuePort {

  /**
   * Runs enqueue for background queue.
   * @param queue Queue (BackgroundQueueKey).
   * @param description Description (string).
   * @param run Callback or factory for run.
   * @param options Options (BackgroundQueueEnqueueOptions).
   * @returns BackgroundQueueContinuation result.
   */
  abstract enqueue(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation;
}
