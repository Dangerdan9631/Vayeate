import { singleton } from 'tsyringe';
import { AppActionEnqueueGateway } from '../../../gateway/app-action-enqueue-gateway';

/** Routes follow-up UI actions through the gateway from domain code (controllers call this operation, not the gateway). */
@singleton()
export class EnqueueAppActionOperation {
  constructor(private readonly appActionEnqueue: AppActionEnqueueGateway) {}

  execute(action: unknown): Promise<void> {
    return this.appActionEnqueue.enqueue(action);
  }
}
