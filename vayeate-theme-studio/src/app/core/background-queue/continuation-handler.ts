import { BackgroundQueueType } from "./background-queue-type";

export interface ContinuationHandler {
  onQueue(queue: BackgroundQueueType): ContinuationHandler;
  then(description: string, onResolve: () => void): void;
}
