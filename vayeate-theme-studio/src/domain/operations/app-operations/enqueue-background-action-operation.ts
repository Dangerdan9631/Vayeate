import { singleton } from 'tsyringe';
import { BackgroundQueue } from '../../../app/core/actions/background-queue';

@singleton()
export class EnqueueBackgroundActionOperation {
  constructor(
    private readonly backgroundQueue: BackgroundQueue,
  ) {}
  
  execute(work: () => void | Promise<void>, description: string): Promise<void> {
    return this.backgroundQueue.enqueue(work, description);
  }
}
