import { container, singleton } from 'tsyringe';
import type { AppAction } from '../app/core/actions/app-action';

/**
 * Enqueues {@link AppAction} via {@link ActionQueue} without static imports (avoids circular
 * module graphs between the queue, processor, handlers, and follow-up enqueue paths).
 * Accepts `unknown` so domain callers are not coupled to app action types.
 */
@singleton()
export class AppActionEnqueueGateway {
  enqueue(action: unknown): Promise<void> {
    return import('../app/core/actions/action-queue').then(({ ActionQueue }) =>
      container.resolve(ActionQueue).enqueue(action as AppAction),
    );
  }
}
