import { singleton } from 'tsyringe';
import {
  BackgroundQueue,
} from '../../../app/core/background-queue/background-queue';
import { type BackgroundQueueType } from '../../../app/core/background-queue/background-queue-type';
import { ContinuationHandler } from '../../../app/core/background-queue/continuation-handler';

export type { BackgroundQueueType as BackgroundQueueLane };

@singleton()
export class EnqueueBackgroundQueueActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueue,
  ) {}

  execute(
    queue: BackgroundQueueType,
    description: string,
    run: () => void | Promise<void>,
  ): ContinuationHandler {
    return this.backgroundQueue.enqueue(queue, description, run);
  }

  executeReturning<T>(
    description: string,
    factory: () => Promise<T>,
    queue: BackgroundQueueType = 'worker',
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        try {
          resolve(await factory());
        } catch (e) {
          reject(e);
        }
      };
      this.backgroundQueue.enqueue(queue, description, run);
    });
  }
}
