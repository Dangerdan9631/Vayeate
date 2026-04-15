import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schemas';
import { EnqueueAppActionOperation } from '../../../operations/app-operations/enqueue-app-action-operation';
import { CommitEyedropperColorOperation } from '../../../operations/theme-operations/eyedropper/commit-eyedropper-color-operation';
import { SetEyedropperPickResultOperation } from '../../../operations/theme-operations/eyedropper/set-eyedropper-pick-result-operation';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';

/** Queued pick commit for app-shell overlay: stash hex, apply to theme, then optional follow-up action. */
@singleton()
export class CommitEyedropperOverlayPickController {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
    private readonly setEyedropperPickResult: SetEyedropperPickResultOperation,
    private readonly commitEyedropperColor: CommitEyedropperColorOperation,
    private readonly enqueueAppAction: EnqueueAppActionOperation,
  ) {}

  async run(hex: HexColor): Promise<void> {
    const followUp = this.eyedropperUiStore.getStore().state.pendingPostCommit;
    this.setEyedropperPickResult.execute(hex);
    this.commitEyedropperColor.execute();
    if (followUp !== null) {
      void this.enqueueAppAction.execute(followUp);
    }
  }
}
