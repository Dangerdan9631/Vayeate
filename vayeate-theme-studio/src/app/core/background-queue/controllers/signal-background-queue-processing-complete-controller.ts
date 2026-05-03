import { singleton } from 'tsyringe';
import { CompleteBackgroundQueueProcessingOperation } from '../../../../domain/operations/background-queue/complete-background-queue-processing-operation';
import { BackgroundQueueType } from '../background-queue-type';

@singleton()
export class SignalBackgroundQueueProcessingCompleteController {
  constructor(private readonly completeBackgroundQueueProcessing: CompleteBackgroundQueueProcessingOperation) {}

  run( queueType: BackgroundQueueType ): void {
    this.completeBackgroundQueueProcessing.execute(queueType);
  }
}
