import { singleton } from 'tsyringe';
import type { AppActionV2 } from './action-types';
import { LoggerFactory, type Logger } from '../../domain/utils/logger';
import { HandlerDepsSource } from '../di/handler-deps-source';
import { ActionProcessor } from '../handlers/handler-registry';

export interface QueueStatus {
  isProcessing: boolean;
  queueLength: number;
}

interface QueuedAction {
  action: AppActionV2;
  resolve: () => void;
}

@singleton()
export class ActionQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly handlerDepsSource: HandlerDepsSource,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
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
        await this.actionProcessor.process(action, this.handlerDepsSource.get());
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
