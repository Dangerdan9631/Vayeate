import type { AppAction } from './action-types';
import type { AppStateUpdate } from '../state/app-state';
import { createLogger } from '../utils/logger';

const log = createLogger('ActionQueue');

export interface QueueStatus {
  isProcessing: boolean;
  queueLength: number;
}

export type ActionProcessor = (
  action: AppAction,
  setState: (update: AppStateUpdate) => void
) => Promise<void>;

export class ActionQueue {
  private queue: AppAction[] = [];
  private processing = false;
  private processor: ActionProcessor;

  constructor(processor: ActionProcessor) {
    this.processor = processor;
  }

  enqueue(action: AppAction): void {
    log.debug('enqueue', action.type, `(queue depth: ${this.queue.length})`);
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
        log.debug('processing', action.type);
        await this.processor(action, setState);
        log.debug('completed', action.type);
      } catch (err) {
        log.error('failed', action.type, err);
      }
    }

    this.processing = false;
    log.debug('queue drained');
    this.emitStatus();
  }

  private emitStatus(): void {
    this.onQueueStatus({ isProcessing: this.processing, queueLength: this.queue.length });
  }

  onStateUpdate: (update: AppStateUpdate) => void = () => {};
  onQueueStatus: (status: QueueStatus) => void = () => {};
}
