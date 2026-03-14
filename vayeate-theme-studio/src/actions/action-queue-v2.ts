import type { AppActionV2 } from './action-types';
import type { AppStateUpdate } from '../state/app-state';
import type { QueueStatus } from './action-queue';

export type ActionProcessorV2 = (
  action: AppActionV2,
  setState: (update: AppStateUpdate) => void
) => Promise<void>;

export class ActionQueueV2 {
  private queue: AppActionV2[] = [];
  private processing = false;
  private processor: ActionProcessorV2;

  constructor(processor: ActionProcessorV2) {
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
      } catch {
        // swallow so queue continues
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
