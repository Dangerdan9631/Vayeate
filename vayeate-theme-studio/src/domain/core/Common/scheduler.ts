/**
 * Default interval for cooperative yielding in long deferred-queue CPU loops.
 * Keeps synchronous stretches under one frame budget when used with {@link yieldEvery}.
 */
export const DEFERRED_WORK_YIELD_INTERVAL = 20;

/**
 * Resolves on the next macrotask so the event loop (and paint) can run.
 * Uses MessageChannel rather than requestAnimationFrame so yielding continues
 * when the window is hidden or minimized.
 */
export function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      channel.port2.close();
      resolve();
    };
    channel.port2.postMessage(undefined);
  });
}

/**
 * Returns a gate that yields once every `n` invocations. Useful for chunking
 * long synchronous loops without monopolizing a frame.
 *
 * @param n - Yield after every n calls; must be positive.
 * @param yieldFn - Yield implementation; defaults to {@link yieldToEventLoop}.
 * @returns Async function to call once per loop iteration.
 */
export function createYieldEvery(
  n: number,
  yieldFn: () => Promise<void> = yieldToEventLoop,
): () => Promise<void> {
  if (n <= 0) {
    throw new RangeError('yieldEvery interval must be positive');
  }

  let counter = 0;
  return async () => {
    counter += 1;
    if (counter % n === 0) {
      await yieldFn();
    }
  };
}

/**
 * Returns a gate that yields once every `n` invocations.
 *
 * @param n - Yield after every n calls; must be positive.
 * @returns Async function to call once per loop iteration.
 */
export function yieldEvery(n: number): () => Promise<void> {
  return createYieldEvery(n);
}
