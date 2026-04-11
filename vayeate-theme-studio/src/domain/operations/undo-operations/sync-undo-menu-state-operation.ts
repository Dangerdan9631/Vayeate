import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import { UndoStackStateGetter, UndoStackStateSetter } from '../../state/undo-stack/undo-stack-state-reducer';
import { emptyUndoMenuSnapshot } from '../../state/undo-stack/undo-stack-state';

@singleton()
export class SyncUndoMenuStateOperation {
  constructor(
    private readonly undoStackStateSetter: UndoStackStateSetter,
    private readonly undoStackStateGetter: UndoStackStateGetter,
  ) {}

  async execute(): Promise<void> {
    const snap = this.undoStackStateGetter.current();
    if (!snap.currentUndoStackId) {
      this.undoStackStateSetter.apply({ type: 'SET_UNDO_MENU_SNAPSHOT', snapshot: emptyUndoMenuSnapshot });
      return;
    }
    const processor = createUndoProcessor();
    const stack = await undoManagerV2.getOrCreate(snap.currentUndoStackId, { processor });
    const list = stack.list();
    this.undoStackStateSetter.apply({
      type: 'SET_UNDO_MENU_SNAPSHOT',
      snapshot: {
        frames: list.frames,
        currentId: list.currentId,
        canUndo: stack.canUndo,
        canRedo: stack.canRedo,
      },
    });
  }
}
