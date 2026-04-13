import { container, singleton } from 'tsyringe';

/**
 * Enqueues background work via {@link BackgroundQueue} without static imports (avoids circular
 * module graphs between the queue, domain operations, and follow-up enqueue paths).
 */
@singleton()
export class BackgroundQueueGateway {
  enqueue(work: () => void | Promise<void>, description: string): Promise<void> {
    return import('../app/core/actions/background-queue').then(({ BackgroundQueue }) =>
      container.resolve(BackgroundQueue).enqueue(work, description),
    );
  }
}
