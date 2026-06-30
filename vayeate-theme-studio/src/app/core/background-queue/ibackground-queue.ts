import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
} from '../../../model/background-queue';

/**
 * Contract for a single background queue implementation that runs deferred work.
 */
export interface IBackgroundQueue {
  /**
   * Schedules work and returns a continuation for optional follow-up chaining.
   *
   * @param description - Human-readable label for queue status observability.
   * @param run - Synchronous or async function to execute when dequeued.
   * @param options - Optional keyed access options (required for `data_io` keyed lanes).
   * @returns A continuation resolver for `onQueue` / `then` chaining.
   */
  enqueue(
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation;
}
