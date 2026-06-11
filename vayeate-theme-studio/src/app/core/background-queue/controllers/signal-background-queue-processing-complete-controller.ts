import { singleton } from 'tsyringe';
import { CompleteBackgroundQueueProcessingOperation } from '../../../../domain/operations/background-queue/complete-background-queue-processing-operation';
import type { BackgroundQueueKey } from '../../../../model/background-queue';

/**
 * Signals that a background queue has drained and is idle again.
 * Invoked directly by queue implementations (documented mutation-flow exception).
 */
@singleton()
export class SignalBackgroundQueueProcessingCompleteController {
  constructor(private readonly completeBackgroundQueueProcessing: CompleteBackgroundQueueProcessingOperation) {}

  run( queueType: BackgroundQueueKey ): void {
    this.completeBackgroundQueueProcessing.execute(queueType);
  }
}
