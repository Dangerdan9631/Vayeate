import { singleton } from 'tsyringe';
import { CompleteActionQueueProcessingOperation } from '../../../../domain/operations/action-queue/complete-action-queue-processing-operation';

/**
 * Signals that the action queue has drained and is idle again.
 * Invoked directly by `ActionQueue` (documented mutation-flow exception).
 */
@singleton()
export class SignalActionQueueProcessingCompleteController {
  constructor(private readonly completeActionQueueProcessing: CompleteActionQueueProcessingOperation) {}

  run(): void {
    this.completeActionQueueProcessing.execute();
  }
}
