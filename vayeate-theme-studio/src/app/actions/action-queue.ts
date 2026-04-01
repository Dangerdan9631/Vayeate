import { singleton } from 'tsyringe';
import type { AppAction } from './action-types';
import { LoggerFactory, type Logger } from '../../domain/utils/logger';
import { ActionProcessor } from './handler-registry';
import type { HandlerDeps } from './handler-types';

export interface QueueStatus {
  isProcessing: boolean;
  queueLength: number;
}

interface QueuedAction {
  action: AppAction;
  resolve: () => void;
}

@singleton()
export class ActionQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private readonly log: Logger;
  private depsGetter: (() => HandlerDeps) | null = null;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
  }

  setDepsGetter(getter: () => HandlerDeps): void {
    this.depsGetter = getter;
  }

  enqueue(action: AppAction): Promise<void> {
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
        if (!this.depsGetter) {
          throw new Error('ActionQueue deps getter is not configured.');
        }
        await this.actionProcessor.process(action, this.depsGetter());
      } catch (err) {
        this.log.error('Error processing action:', action.type, err);
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
