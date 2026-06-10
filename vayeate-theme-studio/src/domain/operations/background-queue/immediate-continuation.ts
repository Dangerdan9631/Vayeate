import type { BackgroundQueueContinuation, BackgroundQueueKey } from '../../../model/background-queue';

/** Resolves synchronously when `.then()` is called — for store-cache hits that skip disk I/O. */
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
