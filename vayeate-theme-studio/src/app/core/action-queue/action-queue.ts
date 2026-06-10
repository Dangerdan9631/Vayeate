import type { AppAction } from './app-action';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { ActionProcessor } from './action-processor';
import { singleton } from 'tsyringe';
import { UpdateActionQueueStatusController } from './controllers/update-action-queue-status-controller';
import { SignalActionQueueProcessingCompleteController } from './controllers/signal-action-queue-processing-complete-controller';
import { tryCoalesce } from './action-coalescing-policy';

function describeAction(action: AppAction): string {
  return action.type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface IActionQueue {
  enqueue(action: AppAction): void;
}

@singleton()
export class ActionQueue implements IActionQueue {
  private queue: AppAction[] = [];
  private isProcessing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly updateActionQueueStatus: UpdateActionQueueStatusController,
    private readonly signalActionQueueProcessingComplete: SignalActionQueueProcessingCompleteController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
  }

  enqueue(action: AppAction): void {
    // Scan backwards through pending actions: if a coalescing policy matches,
    // merge into the most-recent matching entry instead of appending.
    // The currently-processing action (already shifted out) is never touched,
    // preserving at-least-once delivery of the final value.
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const merged = tryCoalesce(this.queue[i], action);
      if (merged !== null) {
        this.queue[i] = merged;
        void this.process();
        return;
      }
    }
    this.queue.push(action);
    void this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const action = this.queue.shift()!;
      this.updateActionQueueStatus.run(this.queue.length + 1, describeAction(action));
      try {
        await this.actionProcessor.process(action);
      } catch (err) {
        this.log.error('Error processing action:', action.type, err);
      }
    }

    this.signalActionQueueProcessingComplete.run();
    this.isProcessing = false;
  }
}
