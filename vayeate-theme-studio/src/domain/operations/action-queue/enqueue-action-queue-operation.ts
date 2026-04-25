import { singleton } from 'tsyringe';
import { AppAction } from '../../../app/core/action-queue/app-action';
import { ActionQueue } from '../../../app/core/action-queue/action-queue';

@singleton()
export class EnqueueActionQueueOperation {
  constructor(
    private readonly actionQueue: ActionQueue
  ) { }

  execute(action: AppAction): void {
    this.actionQueue.enqueue(action);
  }
}
