import { BackgroundQueueResolver } from './background-queue-resolver';

export interface QueuedWork {
  description: string;
  run: () => void | Promise<void>;
  resolver: BackgroundQueueResolver;
}
