import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schemas';
import { EnqueueAppActionOperation } from '../../../operations/app-operations/enqueue-app-action-operation';
import { CommitEyedropperColorOperation, SetEyedropperPickResultOperation } from '../../../operations/theme-operations';
import { UiStateGetter } from '../../../state/ui/ui-state-reducer';

/** Queued pick commit for app-shell overlay: stash hex, apply to theme, then optional follow-up action. */
@singleton()
export class CommitEyedropperOverlayPickController {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly setEyedropperPickResult: SetEyedropperPickResultOperation,
    private readonly commitEyedropperColor: CommitEyedropperColorOperation,
    private readonly enqueueAppAction: EnqueueAppActionOperation,
  ) {}

  run(hex: HexColor): void {
    const followUp = this.uiStateGetter.current().eyedropper.pendingPostCommit;
    this.setEyedropperPickResult.execute(hex);
    this.commitEyedropperColor.execute();
    if (followUp !== null) {
      void this.enqueueAppAction.execute(followUp);
    }
  }
}
