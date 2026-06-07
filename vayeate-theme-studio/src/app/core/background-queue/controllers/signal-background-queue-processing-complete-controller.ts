import { singleton } from 'tsyringe';
import { CompleteBackgroundQueueProcessingOperation } from '../../../../domain/operations/background-queue/complete-background-queue-processing-operation';
import type { BackgroundQueueKey } from '../../../../model/background-queue';

@singleton()
export class SignalBackgroundQueueProcessingCompleteController {
  constructor(private readonly completeBackgroundQueueProcessing: CompleteBackgroundQueueProcessingOperation) {}

  run( queueType: BackgroundQueueKey ): void {
    this.completeBackgroundQueueProcessing.execute(queueType);
  }
}
