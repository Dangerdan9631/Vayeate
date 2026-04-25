import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../../domain/utils/logger';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { CompleteBackgroundQueueProcessingController } from './controllers/complete-background-queue-processing-controller';

interface QueuedWork {
  description: string;
  run: () => void | Promise<void>;
  resolve: () => void;
}

@singleton()
export class BackgroundQueue {
  private queue: QueuedWork[] = [];
  private processing = false;
  private readonly log: Logger;

  constructor(
    private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    private readonly completeBackgroundQueueProcessing: CompleteBackgroundQueueProcessingController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(description: string, run: () => void | Promise<void>, resolve: () => void): void {
    this.log.debug('background', description);
    this.queue.push({ description, run, resolve });
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const { run, resolve, description } = this.queue.shift()!;

      this.updateBackgroundQueueStatus.run(description, this.queue.length);
      try {
        await run();
      } catch (err) {
        this.log.error('Error running background work:', err);
      } finally {
        resolve();
      }
    }

    this.completeBackgroundQueueProcessing.run();
    this.processing = false;
  }
}
