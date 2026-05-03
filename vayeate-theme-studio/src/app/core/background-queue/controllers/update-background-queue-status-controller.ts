import { singleton } from 'tsyringe';
import { UpdateBackgroundQueueStatusOperation } from '../../../../domain/operations/background-queue/update-background-queue-status-operation';
import { BackgroundQueueType } from '../background-queue-type';

@singleton()
export class UpdateBackgroundQueueStatusController {
  constructor(private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusOperation) {}

  run(queueType: BackgroundQueueType, descriptions: string[], queueLength: number): void {
    this.updateBackgroundQueueStatus.execute(queueType, descriptions, queueLength);
  }
}
