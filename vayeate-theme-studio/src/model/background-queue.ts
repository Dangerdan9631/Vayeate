/**
 * Identifies which background queue handles a unit of async work.
 */
export type BackgroundQueueKey = 'main' | 'worker' | 'data_io';

/**
 * Read or write access mode used to order `data_io` tasks per file key.
 */
export type DataIoAccessMode = 'read' | 'write';

/**
 * Optional enqueue metadata for background queue scheduling.
 */
export interface BackgroundQueueEnqueueOptions {
  /**
   * File path or logical file key for per-file ordering on `data_io`.
   */
  key?: string;
  /**
   * Required when `key` is set for `data_io`; ignored on other queues.
   */
  access?: DataIoAccessMode;
}

/**
 * Fluent builder for chaining background work across queues.
 */
export interface BackgroundQueueContinuation {
  /**
   * Schedules follow-up work on the given queue.
   */
  onQueue(queue: BackgroundQueueKey): BackgroundQueueContinuation;
  /**
   * Registers a callback to run when the chained work resolves.
   */
  then(description: string, onResolve: () => void): void;
}
