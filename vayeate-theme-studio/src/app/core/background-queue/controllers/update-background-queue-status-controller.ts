import { singleton } from 'tsyringe';
import { UpdateBackgroundQueueStatusOperation } from '../../../../domain/operations/background-queue/update-background-queue-status-operation';
import type { BackgroundQueueKey } from '../../../../model/background-queue';

@singleton()
export class UpdateBackgroundQueueStatusController {
  constructor(private readonly updateBackgroundQueueStatus: UpdateBackgroundQueueStatusOperation) {}

  run(queueType: BackgroundQueueKey, descriptions: string[], queueLength: number): void {
    this.updateBackgroundQueueStatus.execute(queueType, descriptions, queueLength);
  }
}
