import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoGateway } from '../../../gateway/undo/undo-gateway';

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
@singleton()
export class ClearPersistedUndo {
  constructor(private readonly undoGateway: UndoGateway) {}

  async execute(): Promise<void> {
    undoManagerV2.configure({ persistence: this.undoGateway });
    await undoManagerV2.clearPersisted();
  }
}
