import type { AppActionV2 } from './action-types';
import { createLogger } from '../../domain/utils/logger';

const log = createLogger('ActionQueue');

export interface QueueStatus {
  isProcessing: boolean;
  queueLength: number;
}

export type ActionProcessor = (action: AppActionV2) => Promise<void>;

interface QueuedAction {
  action: AppActionV2;
  resolve: () => void;
}

export class ActionQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private processor: ActionProcessor;

  constructor(processor: ActionProcessor) {
    this.processor = processor;
  }

  enqueue(action: AppActionV2): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push({ action, resolve });
      this.emitStatus();
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    this.emitStatus();

    while (this.queue.length > 0) {
      const { action, resolve } = this.queue.shift()!;
      this.emitStatus();
      try {
        await this.processor(action);
      } catch (err) {
        log.error('Error processing action:', action.type, err);
      } finally {
        resolve();
      }
    }

    this.processing = false;
    this.emitStatus();
  }

  private emitStatus(): void {
    this.onQueueStatus({ isProcessing: this.processing, queueLength: this.queue.length });
  }

  onQueueStatus: (status: QueueStatus) => void = () => {};
}
