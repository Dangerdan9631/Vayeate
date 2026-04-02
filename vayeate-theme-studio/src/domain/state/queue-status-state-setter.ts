import type { QueueStatusState } from './ui-state';

export type SetQueueStatusState = (queueStatus: QueueStatusState) => void;

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve queue status UI updates without `@inject`. */
export class QueueStatusStateSetter {
  constructor(private readonly set: SetQueueStatusState) {}

  apply(queueStatus: QueueStatusState): void {
    this.set(queueStatus);
  }
}
