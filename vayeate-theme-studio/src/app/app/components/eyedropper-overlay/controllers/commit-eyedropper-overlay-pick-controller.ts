import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../../model/schema/primitives';
import { CommitEyedropperColorOperation } from '../../../../../domain/operations/theme-operations/eyedropper/commit-eyedropper-color-operation';
import { SetEyedropperPickResultOperation } from '../../../../../domain/operations/theme-operations/eyedropper/set-eyedropper-pick-result-operation';

/** Queued pick commit for app-shell overlay: stash hex, apply to theme, then optional follow-up action. */
@singleton()
export class CommitEyedropperOverlayPickController {
  constructor(
    private readonly setEyedropperPickResult: SetEyedropperPickResultOperation,
    private readonly commitEyedropperColor: CommitEyedropperColorOperation,
  ) {}

  run(hex: HexColor): void {
    this.setEyedropperPickResult.execute(hex);
    this.commitEyedropperColor.execute();
  }
}
