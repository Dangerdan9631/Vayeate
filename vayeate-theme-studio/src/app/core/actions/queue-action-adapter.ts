import { container, singleton } from 'tsyringe';
import type { AppAction } from './app-action';

/**
 * Enqueues actions via {@link ActionQueue} without static imports (avoids circular module + DI
 * graphs: action-queue → processor → handlers → workflows that must re-enqueue).
 */
@singleton()
export class QueueActionAdapter {
  enqueue(action: AppAction): Promise<void> {
    return import('./action-queue').then(({ ActionQueue }) =>
      container.resolve(ActionQueue).enqueue(action),
    );
  }
}
