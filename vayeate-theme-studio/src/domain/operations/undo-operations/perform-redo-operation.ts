import { singleton } from 'tsyringe';
import { UndoStackStateSetter } from '../../state/undo-stack/undo-stack-state-reducer';
import { UndoStackStateGetter } from '../../state/undo-stack/undo-stack-state-reducer';
import { undoManagerV2 } from '../../core/undo-manager-v2';

@singleton()
export class PerformRedoOperation {
  constructor(
    private readonly undoStackStateSetter: UndoStackStateSetter,
    private readonly undoStackStateGetter: UndoStackStateGetter,
  ) {}

  async execute(): Promise<void> {
    const snap = this.undoStackStateGetter.current();
    const stackId = snap.currentUndoStackId;
    if (!stackId) return;
    const stack = await undoManagerV2.getOrCreate(stackId);
    stack.redo();
    this.undoStackStateSetter.apply({ type: 'SET_UNDO_LIST_VERSION', value: snap.undoListVersion + 1 });
  }
}
