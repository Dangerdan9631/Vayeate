import type { BackgroundQueueContinuation } from '../../../model/background-queue';


export interface IBackgroundQueue {
  enqueue(description: string, run: () => void | Promise<void>): BackgroundQueueContinuation;
}
