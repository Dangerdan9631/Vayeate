import { delay, inject, singleton } from 'tsyringe';
import { BackgroundQueuePort } from '../../../domain/operations/background-queue/background-queue-port';
import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../model/background-queue';
import { DataIoBackgroundQueue } from './data-io-background-queue';
import { MainBackgroundQueue } from './main-background-queue';
import { WorkerBackgroundQueue } from './worker-background-queue';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class BackgroundQueue extends BackgroundQueuePort {
  private readonly log: Logger;

  constructor(
    @inject(delay(() => MainBackgroundQueue))
    private readonly mainQueue: MainBackgroundQueue,
    @inject(delay(() => WorkerBackgroundQueue))
    private readonly workerQueue: WorkerBackgroundQueue,
    @inject(delay(() => DataIoBackgroundQueue))
    private readonly dataIoQueue: DataIoBackgroundQueue,
    loggerFactory: LoggerFactory,
  ) {
    super();
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(
    queue: BackgroundQueueKey,
    description: string,
    run: () => void | Promise<void>,
  ): BackgroundQueueContinuation {
    switch (queue) {
      case 'main':
        return this.mainQueue.enqueue(description, run);
      case 'worker':
        return this.workerQueue.enqueue(description, run);
      case 'data_io':
        return this.dataIoQueue.enqueue(description, run);
      default: {
        const _exhaustive: never = queue;
        this.log.error('Unhandled background queue type', { queueType: _exhaustive });
        throw new Error(`Unhandled background queue type: ${String(queue)}`);
      }
    }
  }
}
