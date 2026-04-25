import { singleton } from 'tsyringe';
import { CompleteActionQueueProcessingOperation } from '../../../../../domain/operations/action-queue/complete-action-queue-processing-operation';

@singleton()
export class CompleteActionQueueProcessingController {
  constructor(private readonly completeActionQueueProcessing: CompleteActionQueueProcessingOperation) {}

  run(): void {
    this.completeActionQueueProcessing.execute();
  }
}
