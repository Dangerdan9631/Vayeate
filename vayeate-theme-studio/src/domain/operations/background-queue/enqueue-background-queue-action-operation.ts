import { singleton } from 'tsyringe';
import { BackgroundQueue } from '../../../app/core/background-queue/background-queue';

const noop = () => { };

@singleton()
export class EnqueueBackgroundQueueActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueue,
  ) {}

  execute(description: string, run: () => void | Promise<void>, resolve?: (() => void) | undefined): void {
    this.backgroundQueue.enqueue(description, run, resolve || noop);
  }
}
