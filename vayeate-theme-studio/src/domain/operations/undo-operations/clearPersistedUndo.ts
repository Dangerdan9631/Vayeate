import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoManagerV2Service } from '../../../gateway/services/undo-manager-v2-service';

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
@singleton()
export class ClearPersistedUndo {
  constructor(private readonly undoManagerV2Service: UndoManagerV2Service) {}

  async execute(): Promise<void> {
    undoManagerV2.configure({ persistence: this.undoManagerV2Service });
    await undoManagerV2.clearPersisted();
  }
}
