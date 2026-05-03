import { type Logger, LoggerFactory } from '../../../domain/utils/logger';
import { BackgroundQueueType } from './background-queue-type';
import { QueuedWork } from './queued-work';
import { ContinuationHandler } from './continuation-handler';
import { BackgroundQueueResolver } from './background-queue-resolver';
import { SignalBackgroundQueueProcessingCompleteController } from './controllers/signal-background-queue-processing-complete-controller';
import { UpdateBackgroundQueueStatusController } from './controllers/update-background-queue-status-controller';
import { IBackgroundQueue } from './ibackground-queue';

export class SerialQueue implements IBackgroundQueue {
  private readonly log: Logger;
  private queue: QueuedWork[] = [];
  private isProcessing = false;

  constructor(
    private readonly queueType: BackgroundQueueType,
    private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusController,
    private readonly signalBackgroundQueueProcessingComplete: SignalBackgroundQueueProcessingCompleteController,
    loggerFactory: LoggerFactory
  ) {
    this.log = loggerFactory.create(`BackgroundQueue[${queueType}]`);
  }

  enqueue(
    description: string,
    run: () => void | Promise<void>
  ): ContinuationHandler {
    const item: QueuedWork = { description, run, resolver: new BackgroundQueueResolver() };
    this.log.debug('enqueue:', description);
    this.queue.push(item);
    void this.processMain();

    return item.resolver;
  }

  private async processMain(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.updateBackgroundQueueStatus.run(this.queueType, [item.description], this.queue.length + 1);
      try {
        await item.run();
      } catch (err) {
        this.log.error('Error running background work:', err);
      } finally {
        item.resolver.onResolve();
      }
    }

    this.isProcessing = false;
    this.signalBackgroundQueueProcessingComplete.run(this.queueType);
  }
}
