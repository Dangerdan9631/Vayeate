import type { AppActionV2 } from './action-types';
import type { AppStateUpdate } from '../../state/app-state';
import { createLogger } from '../../utils/logger';

const log = createLogger('ActionQueue');

export interface QueueStatus {
  isProcessing: boolean;
  queueLength: number;
}

export type ActionProcessor = (
  action: AppActionV2,
  setState: (update: AppStateUpdate) => void
) => Promise<void>;

export class ActionQueue {
  private queue: AppActionV2[] = [];
  private processing = false;
  private processor: ActionProcessor;

  constructor(processor: ActionProcessor) {
    this.processor = processor;
  }

  enqueue(action: AppActionV2): void {
    this.queue.push(action);
    this.emitStatus();
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    this.emitStatus();

    while (this.queue.length > 0) {
      const action = this.queue.shift()!;
      this.emitStatus();
      const setState = (update: AppStateUpdate) => {
        this.onStateUpdate(update);
      };
      try {
        await this.processor(action, setState);
      } catch (err) {
        log.error('Error processing action:', action.type, err);
      }
    }

    this.processing = false;
    this.emitStatus();
  }

  private emitStatus(): void {
    this.onQueueStatus({ isProcessing: this.processing, queueLength: this.queue.length });
  }

  onStateUpdate: (update: AppStateUpdate) => void = () => {};
  onQueueStatus: (status: QueueStatus) => void = () => {};
}
