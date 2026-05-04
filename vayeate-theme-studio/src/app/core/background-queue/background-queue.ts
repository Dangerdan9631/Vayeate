import { delay, inject, singleton } from 'tsyringe';
import { BackgroundQueueResolver } from './background-queue-resolver';
import { ContinuationHandler } from './continuation-handler';
import { QueuedWork } from './queued-work';
import type { IBackgroundQueue } from './ibackground-queue';
import { BackgroundQueueType } from './background-queue-type';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class BackgroundQueue {
  private readonly log: Logger;

  constructor(
    @inject(delay(() => "IBackgroundMainQueue"))
    private readonly mainQueue: IBackgroundQueue,
    @inject(delay(() => "IBackgroundWorkerQueue"))
    private readonly workerQueue: IBackgroundQueue,
    @inject(delay(() => "IBackgroundDataIoQueue"))
    private readonly dataIoQueue: IBackgroundQueue,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(
    queue: BackgroundQueueType,
    description: string,
    run: () => void | Promise<void>,
  ): ContinuationHandler {
    const item: QueuedWork = { description, run, resolver: new BackgroundQueueResolver(description) };
    switch (queue) {
      case 'main':
        this.mainQueue.enqueue(description, run);
        break;
      case 'worker':
        this.workerQueue.enqueue(description, run);
        break;
      case 'data_io':
        this.dataIoQueue.enqueue(description, run);
        break;
      default: {
        const _exhaustive: never = queue;
        this.log.error('Unhandled background queue type (BackgroundQueueType union not exhaustive)', { queueType: _exhaustive });
      }
    }

    return item.resolver;
  }
}
