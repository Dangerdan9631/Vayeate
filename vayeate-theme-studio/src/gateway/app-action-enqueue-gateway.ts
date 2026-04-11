import { container, singleton } from 'tsyringe';

/**
 * Enqueues app actions via {@link ActionQueue} without static imports (avoids circular module
 * graphs between the queue, processor, handlers, and follow-up enqueue paths). Accepts `unknown`
 * so domain callers are not coupled to app-layer action types.
 */
@singleton()
export class AppActionEnqueueGateway {
  enqueue(action: unknown): Promise<void> {
    return import('../app/core/actions/action-queue').then(({ ActionQueue }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- internal cast; queue expects app actions
      container.resolve(ActionQueue).enqueue(action as any),
    );
  }
}
