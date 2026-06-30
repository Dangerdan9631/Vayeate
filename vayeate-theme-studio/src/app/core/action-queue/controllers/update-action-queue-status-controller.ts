import { singleton } from 'tsyringe';
import { UpdateActionQueueStatusOperation } from '../../../../domain/operations/action-queue/update-action-queue-status-operation';

/**
 * Updates observable action-queue status while the queue is processing.
 * Invoked directly by `ActionQueue` (documented mutation-flow exception).
 */
@singleton()
export class UpdateActionQueueStatusController {
  constructor(private readonly setActionQueueProcess: UpdateActionQueueStatusOperation) {}

  run(queueLength: number, currentActionDescription: string): void {
    this.setActionQueueProcess.execute(queueLength, currentActionDescription);
  }
}
