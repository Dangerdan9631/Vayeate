import type { AppAction } from './app-action';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { ActionProcessor } from './action-processor';
import { ActionQueueUiStore } from '../../../domain/state/ui/action-queue-ui-store';
import { ActionQueueUiState } from '../../../domain/state/ui/action-queue-ui-state';
import { IActionQueue } from './IActionQueue';
import { singleton } from 'tsyringe';

interface QueuedAction {
  action: AppAction;
  resolve: () => void;
}

@singleton()
export class ActionQueue implements IActionQueue {
  private queue: QueuedAction[] = [];
  private processing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly actionQueueStore: ActionQueueUiStore,
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
    const description = this.queue.length > 0 ? this.queue[0].action.type : undefined;
    const actionQueueStatus: ActionQueueUiState = {
      isProcessing: this.processing,
      queueLength: this.queue.length,
      description,
    };
    this.actionQueueStore.getStore().setState(actionQueueStatus);
  }
}
