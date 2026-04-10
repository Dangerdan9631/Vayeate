import { injectable } from 'tsyringe';
import type { HexColor } from '../../../model/schemas';
import { CommitEyedropperColorController } from '../../../domain/controllers/theme-controller';
import { SetEyedropperPickResultOperation } from '../../../domain/operations/theme-operations';
import { UiStateGetter } from '../../../domain/state/ui/ui-state-reducer';
import type { AppAction } from '../../core/actions/app-action';
import { ActionQueue } from '../../core/actions/action-queue';

/**
 * Read stashed post-commit from `ui.eyedropper`, write pick into `result`, apply color in domain,
 * then enqueue follow-up without await (avoids ActionQueue deadlock).
 */
@injectable()
export class CommitEyedropperPickWorkflowOperation {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly setEyedropperPickResult: SetEyedropperPickResultOperation,
    private readonly commitEyedropperColor: CommitEyedropperColorController,
    private readonly actionQueue: ActionQueue,
  ) {}

  execute(hex: HexColor): void {
    const followUp = this.uiStateGetter.current().eyedropper.pendingPostCommit;
    this.setEyedropperPickResult.execute(hex);
    this.commitEyedropperColor.run();
    if (followUp !== null) {
      void this.actionQueue.enqueue(followUp as AppAction);
    }
  }
}
