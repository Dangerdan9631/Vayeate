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
    queue: BackgroundQueueType = 'main',
  ): void {
    this.backgroundQueue.enqueue(description, run, resolve || noop, queue);
  }
}
