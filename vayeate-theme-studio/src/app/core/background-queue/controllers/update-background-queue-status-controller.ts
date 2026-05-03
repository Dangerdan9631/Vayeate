import { singleton } from 'tsyringe';
import { UpdateBackgroundQueueStatusOperation } from '../../../../domain/operations/background-queue/update-background-queue-status-operation';

@singleton()
export class UpdateBackgroundQueueStatusController {
  constructor(private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusOperation) {}

  run(args: { main?: { description: string, queueLength: number }, workers?: { descriptions: string[], queueLength: number } }): void {
    this.updateBackgroundQueueStatus.execute(args);
  }
}
