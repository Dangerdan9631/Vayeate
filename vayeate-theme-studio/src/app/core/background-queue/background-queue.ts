import { Semaphore } from 'async-mutex';
import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';

export const BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT = 8;

export type BackgroundQueueType = 'main' | 'worker';

interface QueuedWork {
  description: string;
  run: () => void | Promise<void>;
  resolve: () => void;
}

@singleton()
export class BackgroundQueue {
  private mainQueue: QueuedWork[] = [];
  private mainProcessing = false;

  private workerQueue: QueuedWork[] = [];
  private workerProcessing = false;
  
  private runningWorkerDescriptions: { [key: string]: string } = {};
  private readonly workerSemaphore = new Semaphore(BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT);

  private readonly log: Logger;

  constructor(
    private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    private readonly signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(
    description: string,
    run: () => void | Promise<void>,
    resolve: () => void,
    queue: BackgroundQueueType = 'main',
  ): void {
    const item: QueuedWork = { description, run, resolve };
    switch (queue) {
      case 'worker':
        this.log.debug('enqueue background [worker]', description);
        this.workerQueue.push(item);
        void this.processWorkers();
        return;
      case 'main':
        this.log.debug('enqueue background [main]', description);
        this.mainQueue.push(item);
        void this.processMain();
        return;
      default: {
        const _exhaustive: never = queue;
        this.log.error('Unhandled background lane (BackgroundQueueLane union not exhaustive)', { lane: _exhaustive });
      }
    }
  }

  private async processMain(): Promise<void> {
    if (this.mainProcessing) return;
    this.mainProcessing = true;

    while (this.mainQueue.length > 0) {
      const item = this.mainQueue.shift()!;
      this.updateBackgroundQueueStatus.run({ main: { description: item.description, queueLength: this.mainQueue.length + 1 } });
      try {
        await item.run();
      } catch (err) {
        this.log.error('Error running background work:', err);
      } finally {
        item.resolve();
      }
    }

    this.mainProcessing = false;
    this.signalBackgroundQueueProcessingComplete.run('main');
  }

  private async processWorkers(): Promise<void> {
    if (this.workerProcessing) return;
    this.workerProcessing = true;

    while (this.workerQueue.length > 0 || this.workerSemaphore.getValue() < BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT) {
      if (this.workerQueue.length > 0) {
        await this.workerSemaphore.acquire(1);
        const item = this.workerQueue.shift()!;
        void this.runWorker(item);
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.workerProcessing = false;
    this.signalBackgroundQueueProcessingComplete.run('main');
  }

  private async runWorker(item: QueuedWork): Promise<void> {
    const workerId = crypto.randomUUID();
    this.runningWorkerDescriptions[workerId] = item.description;

    this.updateBackgroundQueueStatus.run({
      workers: {
        descriptions: Object.values(this.runningWorkerDescriptions),
        queueLength: this.workerQueue.length + (BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT - this.workerSemaphore.getValue()),
      },
    });
    try {
      await item.run();
    } catch (err) {
      this.log.error('Error running background work:', err);
    } finally {
      try {
        item.resolve();
      } catch (err) {
        this.log.error('Error resolving background work:', err);
      } finally {
        this.workerSemaphore.release(1);
        delete this.runningWorkerDescriptions[workerId];
        this.updateBackgroundQueueStatus.run({
          workers: {
            descriptions: Object.values(this.runningWorkerDescriptions),
            queueLength: this.workerQueue.length + (BACKGROUND_QUEUE_WORKER_CONCURRENCY_LIMIT - this.workerSemaphore.getValue()),
          },
        });
      }
    }
  }
}
