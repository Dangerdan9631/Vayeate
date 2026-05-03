import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { BackgroundQueueResolver } from './background-queue-resolver';
import { ContinuationHandler } from './continuation-handler';
import { QueuedWork } from './queued-work';
import { SerialQueue } from './serial-queue';
import { IBackgroundQueue } from './ibackground-queue';
import { BackgroundQueueType } from './background-queue-type';
import { PooledQueue } from './pooled-queue';

export const BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT = 16;

@singleton()
export class BackgroundQueue {
  private readonly mainQueue: IBackgroundQueue;
  private readonly workerQueue: IBackgroundQueue;
  private readonly log: Logger;

  constructor(
    private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    private readonly signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('BackgroundQueue');
    this.mainQueue = new SerialQueue('main', this.updateBackgroundQueueStatus, this.signalBackgroundQueueProcessingComplete, loggerFactory);
    this.workerQueue = new PooledQueue('worker', BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT, this.updateBackgroundQueueStatus, this.signalBackgroundQueueProcessingComplete, loggerFactory);
  }

  enqueue(
    queue: BackgroundQueueType,
    description: string,
    run: () => void | Promise<void>,
  ): ContinuationHandler {
    const item: QueuedWork = { description, run, resolver: new BackgroundQueueResolver() };
    switch (queue) {
      case 'worker':
        this.workerQueue.enqueue(description, run);
        break;
      case 'main':
        this.mainQueue.enqueue(description, run);
        break;
      default: {
        const _exhaustive: never = queue;
        this.log.error('Unhandled background lane (BackgroundQueueLane union not exhaustive)', { lane: _exhaustive });
      }
    }

    return item.resolver;
  }
}
