import { singleton } from 'tsyringe';
import type {
  BackgroundQueueContinuation,
  BackgroundQueueEnqueueOptions,
  BackgroundQueueKey,
} from '../../../model/background-queue';
import { BackgroundQueuePort } from './background-queue-port';

@singleton()
export class EnqueueBackgroundQueueActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueuePort,
  ) {}

  execute(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
    options?: BackgroundQueueEnqueueOptions,
  ): BackgroundQueueContinuation {
    return this.backgroundQueue.enqueue(queue, description, run, options);
  }

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
