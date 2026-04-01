import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import { AppStateSetter } from '../../state/app-state-setter';
import { AppStateGetter } from '../../state/app-state-getter';

@singleton()
export class PerformHistoryGoToOperation {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly appStateGetter: AppStateGetter,
  ) {}

  async execute(frameId: string): Promise<void> {
    const state = this.appStateGetter.current();
    const stackId = state.undoStackId.currentUndoStackId;
    if (!stackId) return;
    const processor = createUndoProcessor((u) => this.appStateSetter.apply(u));
    const stack = await undoManagerV2.getOrCreate(stackId, { processor });
    const didGoto = stack.goto(frameId);
    if (didGoto) {
      this.appStateSetter.apply({ type: 'SET_UNDO_LIST_VERSION', value: state.undoStackId.undoListVersion + 1 });
    }
  }
}
