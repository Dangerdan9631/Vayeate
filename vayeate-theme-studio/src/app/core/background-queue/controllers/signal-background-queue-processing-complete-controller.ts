import { singleton } from 'tsyringe';
import { CompleteBackgroundQueueProcessingOperation } from '../../../../domain/operations/background-queue/complete-background-queue-processing-operation';

@singleton()
export class SignalBackgroundQueueProcessingCompleteController {
  constructor(private readonly completeBackgroundQueueProcessing: CompleteBackgroundQueueProcessingOperation) {}

  run(): void {
    this.completeBackgroundQueueProcessing.execute();
  }
}
