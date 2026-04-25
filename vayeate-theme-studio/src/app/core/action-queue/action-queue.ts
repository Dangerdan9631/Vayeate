import type { AppAction } from './app-action';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import { ActionProcessor } from './action-processor';
import { singleton } from 'tsyringe';
import { FinishActionQueueProcessingOperation } from '../../../domain/operations/action-queue/finish-action-queue-processing-operation';
import { SetActionQueueProcessOperation } from '../../../domain/operations/action-queue/set-action-queue-process-operation';

@singleton()
export class ActionQueue {
  private queue: AppAction[] = [];
  private isProcessing = false;
  private readonly log: Logger;

  constructor(
    private readonly actionProcessor: ActionProcessor,
    private readonly setActionQueueProcess: SetActionQueueProcessOperation,
    private readonly finishActionQueueProcessing: FinishActionQueueProcessingOperation,
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
      this.setActionQueueProcess.execute(this.queue.length + 1);
      try {
        await this.actionProcessor.process(action);
      } catch (err) {
        this.log.error('Error processing action:', action.type, err);
      }
    }

    this.finishActionQueueProcessing.execute();
    this.isProcessing = false;
  }
}
