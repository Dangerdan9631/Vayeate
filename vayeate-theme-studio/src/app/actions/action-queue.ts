import { singleton } from 'tsyringe';
import type { AppAction } from './app-action';
import type { QueueStatusState } from '../../domain/state/ui/ui-state';
import { QueueStatusStateSetter } from '../../domain/state/ui/queue-status-state-reducer';
import { LoggerFactory, type Logger } from '../../domain/utils/logger';
import { ActionProcessor } from './handler-registry';

interface QueuedAction {
  action: AppAction;
  resolve: () => void;
}

@singleton()
export class ActionQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly queueStatusSetter: QueueStatusStateSetter,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
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
        await this.actionProcessor.process(action);
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
    const queueStatus: QueueStatusState = {
      isProcessing: this.processing,
      queueLength: this.queue.length,
    };
    this.queueStatusSetter.apply(queueStatus);
  }
}
