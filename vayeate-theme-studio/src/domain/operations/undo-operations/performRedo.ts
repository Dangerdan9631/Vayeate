import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import { AppStateSetter } from '../../state/app-state-setter';
import { AppStateGetter } from '../../state/app-state-getter';

@singleton()
export class PerformRedo {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async execute(): Promise<void> {
    const state = this.appStateGetter.current();
    const stackId = state.undoStackId.currentUndoStackId;
    if (!stackId) return;
    const processor = createUndoProcessor((u) => this.appStateSetter.apply(u));
    const stack = await undoManagerV2.getOrCreate(stackId, { processor });
    const didRedo = stack.redo();
    if (didRedo) {
      this.appStateSetter.apply({ type: 'SET_UNDO_LIST_VERSION', value: state.undoStackId.undoListVersion + 1 });
    }
  }
}
