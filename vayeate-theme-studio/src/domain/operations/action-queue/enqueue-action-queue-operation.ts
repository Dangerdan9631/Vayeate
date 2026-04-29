import { inject, singleton } from 'tsyringe';
import { AppAction } from '../../../app/core/action-queue/app-action';
import { type IActionQueue } from '../../../app/core/action-queue/action-queue';

@singleton()
export class EnqueueActionQueueOperation {
  constructor(
    @inject("IActionQueue")
    private readonly actionQueue: IActionQueue
  ) { }

  execute(action: AppAction): void {
    this.actionQueue.enqueue(action);
  }
}
