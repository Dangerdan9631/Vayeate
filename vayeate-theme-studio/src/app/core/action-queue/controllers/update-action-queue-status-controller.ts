import { singleton } from 'tsyringe';
import { UpdateActionQueueStatusOperation } from '../../../../domain/operations/action-queue/update-action-queue-status-operation';

@singleton()
export class UpdateActionQueueStatusController {
  constructor(private readonly setActionQueueProcess: UpdateActionQueueStatusOperation) {}

  run(queueLength: number, currentActionDescription: string): void {
    this.setActionQueueProcess.execute(queueLength, currentActionDescription);
  }
}
