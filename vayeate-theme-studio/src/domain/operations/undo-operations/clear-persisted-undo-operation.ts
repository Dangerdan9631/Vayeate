import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoGateway } from '../../../gateway/undo/undo-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../app/core/background-queue/continuation-handler';

@singleton()
export class ClearPersistedUndoOperation {
  constructor(
    private readonly undoGateway: UndoGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(): ContinuationHandler {
    undoManagerV2.configure({ persistence: this.undoGateway });
    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Clearing persisted undo',
      async () => {
        await undoManagerV2.clearPersisted();
      }
    );
  }
}
