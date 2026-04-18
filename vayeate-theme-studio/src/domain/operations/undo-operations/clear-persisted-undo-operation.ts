import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoGateway } from '../../../gateway/undo/undo-gateway';
import { EnqueueBackgroundActionOperation } from '../app-operations/enqueue-background-action-operation';

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
@singleton()
export class ClearPersistedUndoOperation {
  constructor(
    private readonly undoGateway: UndoGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) { }

  execute():void {
    undoManagerV2.configure({ persistence: this.undoGateway });
    this.backgroundQueueGateway.execute(async() => {
      await undoManagerV2.clearPersisted();
    }, 'Clearing persisted undo');
  }
}
