import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { BackgroundQueueUiStore } from '../../../domain/state/ui/background-queue-ui-store';
import { BackgroundQueueUiState } from '../../../domain/state/ui/background-queue-ui-state';

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
    private readonly backgroundQueueStore: BackgroundQueueUiStore,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('BackgroundQueue');
  }

  enqueue(work: () => void | Promise<void>, description: string): Promise<void> {
    this.log.debug('background', description);
    return new Promise((resolve) => {
      this.queue.push({ description, run: work, resolve });
      this.emitStatus();
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    this.emitStatus();

    while (this.queue.length > 0) {
      const { run, resolve } = this.queue.shift()!;
      this.emitStatus();
      try {
        await run();
      } catch (err) {
        this.log.error('Error running background work:', err);
      } finally {
        resolve();
      }
    }

    this.processing = false;
    this.emitStatus();
  }

  private emitStatus(): void {
    const description = this.queue.length > 0 ? this.queue[0].description : undefined;
    const backgroundQueueStatus: BackgroundQueueUiState = {
      isProcessing: this.processing,
      queueLength: this.queue.length,
      description,
    };
    this.backgroundQueueStore.getStore().setState(backgroundQueueStatus);
  }
}
