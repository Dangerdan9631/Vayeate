import { BackgroundQueueResolver } from './background-queue-resolver';

/**
 * One unit of deferred work waiting in a background queue.
 */
export interface QueuedWork {
  description: string;
  run: () => void | Promise<void>;
  resolver: BackgroundQueueResolver;
}
