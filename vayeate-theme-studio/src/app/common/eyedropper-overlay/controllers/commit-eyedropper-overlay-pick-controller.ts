import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schema/primitives';
import { SetEyedropperPickResultOperation } from '../../../../domain/operations/theme-operations/eyedropper/set-eyedropper-pick-result-operation';

/** Queued pick commit for app-shell overlay: stash hex, then let viewmodel dispatch callbackAction. */
@singleton()
export class CommitEyedropperOverlayPickController {
  constructor(
    private readonly setEyedropperPickResult: SetEyedropperPickResultOperation,
  ) {}

  run(hex: HexColor): void {
    this.setEyedropperPickResult.execute(hex);
  }
}
