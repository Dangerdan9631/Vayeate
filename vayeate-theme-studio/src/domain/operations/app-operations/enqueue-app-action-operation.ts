import { delay, inject, singleton } from 'tsyringe';
import type { IActionQueue } from '../../../app/core/actions/IActionQueue';
import { AppAction } from '../../../app/core/actions/app-action';

@singleton()
export class EnqueueAppActionOperation {
  constructor(
    @inject(delay(() => "IActionQueue"))
    private readonly actionQueue: IActionQueue
  ) { }

  execute(action: AppAction): Promise<void> {
    return this.actionQueue.enqueue(action);
  }
}
