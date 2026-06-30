import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../model/background-queue';

/**
 * Builds a background-queue continuation that resolves synchronously on `.then()`.
 * @returns Continuation for cache hits that skip disk I/O.
 */
export function immediateContinuation(): BackgroundQueueContinuation {
  const continuation: BackgroundQueueContinuation = {
    onQueue(_queue: BackgroundQueueKey) {
      return continuation;
    },
    then(_description: string, onResolve: () => void) {
      onResolve();
    },
  };
  return continuation;
}
