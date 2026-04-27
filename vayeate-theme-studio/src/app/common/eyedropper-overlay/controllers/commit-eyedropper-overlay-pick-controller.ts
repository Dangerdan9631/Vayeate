import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schema/primitives';
import { CloseEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/close-eyedropper-operation';

/** Queued pick commit for app-shell overlay: stash hex, then let viewmodel dispatch callbackAction. */
@singleton()
export class CommitEyedropperOverlayPickController {
  constructor(
    private readonly closeEyedropper: CloseEyedropperOperation,
  ) {}

  run(hex: HexColor): void {
    this.closeEyedropper.execute(hex);
  }
}
