export type BackgroundQueueKey = 'main' | 'worker' | 'data_io';

export interface BackgroundQueueContinuation {
  onQueue(queue: BackgroundQueueKey): BackgroundQueueContinuation;
  then(description: string, onResolve: () => void): void;
}
