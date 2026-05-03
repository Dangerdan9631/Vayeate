import { ContinuationHandler } from './continuation-handler';


export interface IBackgroundQueue {
  enqueue(description: string, run: () => void | Promise<void>): ContinuationHandler;
}
