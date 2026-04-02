import type { QueueStatusState } from './ui-state';

export type GetQueueStatusState = () => QueueStatusState;

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve queue status reads without `@inject`. */
export class QueueStatusStateGetter {
  constructor(private readonly get: GetQueueStatusState) {}

  current(): QueueStatusState {
    return this.get();
  }
}
