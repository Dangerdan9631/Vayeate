export type BackgroundQueueKey = 'main' | 'worker' | 'data_io';

export type DataIoAccessMode = 'read' | 'write';

export interface BackgroundQueueEnqueueOptions {
  /** File path or logical file key for per-file ordering on `data_io`. */
  key?: string;
  /** Required when `key` is set for `data_io`; ignored on other queues. */
  access?: DataIoAccessMode;
}

export interface BackgroundQueueContinuation {
  onQueue(queue: BackgroundQueueKey): BackgroundQueueContinuation;
  then(description: string, onResolve: () => void): void;
}
