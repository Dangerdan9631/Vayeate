import { singleton } from 'tsyringe';
import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
} from '../../../model/background-queue';
import { BackgroundQueuePort } from './background-queue-port';

/**
 * Enqueues background queue action on the action or background queue.
 */

@singleton()
export class EnqueueBackgroundQueueActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueuePort,
  ) {}

  /**
   * Runs the enqueue background queue action mutation.
   * @param queue Queue (BackgroundQueueKey).
   * @param description Description (string).
   * @param run Callback or factory for run.
   * @param options Options (BackgroundQueueEnqueueOptions).
   * @returns Background-queue continuation for chained async work.
   */

  execute(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation {
    return this.backgroundQueue.enqueue(queue, description, run, options);
  }

  /**
   * Runs execute returning for enqueue background queue action.
   * @param description Description (string).
   * @param factory Callback or factory for factory.
   * @param queue Queue (BackgroundQueueKey).
   * @param options Options (BackgroundQueueEnqueueOptions).
   * @returns Promise resolving to T.
   */

  executeReturning<T>(
    description: string,
    factory: () => Promise<T>,
    queue: BackgroundQueueKey,
    options?: BackgroundQueueEnqueueOptions,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        try {
          resolve(await factory());
        } catch (e) {
          reject(e);
        }
      };
      this.backgroundQueue.enqueue(queue, description, run, options);
    });
  }
}
