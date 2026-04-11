import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoGateway } from '../../../gateway/undo/undo-gateway';
import { BackgroundQueueGateway } from '../../../gateway/background-queue-gateway';

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
@singleton()
export class ClearPersistedUndoOperation {
  constructor(
    private readonly undoGateway: UndoGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) { }

  execute():void {
    undoManagerV2.configure({ persistence: this.undoGateway });
    this.backgroundQueueGateway.enqueue(async() => {
      await undoManagerV2.clearPersisted();
    });
  }
}
