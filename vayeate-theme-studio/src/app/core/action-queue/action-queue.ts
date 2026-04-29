import type { AppAction } from './app-action';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { ActionProcessor } from './action-processor';
import { singleton } from 'tsyringe';
import { UpdateActionQueueStatusController } from './controllers/update-action-queue-status-controller';
import { CompleteActionQueueProcessingController } from './controllers/complete-action-queue-processing-controller';

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
    private readonly completeActionQueueProcessing: CompleteActionQueueProcessingController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionQueue');
  }

  enqueue(action: AppAction): void {
    this.queue.push(action);
    void this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const action = this.queue.shift()!;
      this.updateActionQueueStatus.run(this.queue.length + 1);
      try {
        await this.actionProcessor.process(action);
      } catch (err) {
        this.log.error('Error processing action:', action.type, err);
      }
    }

    this.completeActionQueueProcessing.run();
    this.isProcessing = false;
  }
}
