import { singleton } from 'tsyringe';
import {
  BackgroundQueue,
  type BackgroundQueueType,
} from '../../../app/core/background-queue/background-queue';

const noop = () => { };

export type { BackgroundQueueType as BackgroundQueueLane };

@singleton()
export class EnqueueBackgroundQueueActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueue,
  ) {}

  execute(
    description: string,
    run: () => void | Promise<void>,
    resolve?: (() => void) | undefined,
    queue: BackgroundQueueType = 'worker',
  ): void {
    this.backgroundQueue.enqueue(description, run, resolve || noop, queue);
  }

  /** Runs `factory` on the background queue and resolves when it completes without surfacing duplicate queue swallowing. */
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
      this.backgroundQueue.enqueue(description, run, noop, queue);
    });
  }
}
