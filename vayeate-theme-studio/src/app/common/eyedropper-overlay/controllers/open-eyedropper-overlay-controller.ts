import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../../domain/operations/eyedropper-operations/load-eyedropper-snapshot-operation';
import { OpenEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/open-eyedropper-operation';
import type { EyedropperCommitTarget } from '../../../../model/eyedropper';

/**
 * Opens the eyedropper overlay and starts loading the display snapshot.
 */
@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly openEyedropper: OpenEyedropperOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  /**
   * Records the commit target, opens overlay UI state, and enqueues snapshot capture.
   * @param commitTarget Feature-specific target that receives the picked color on commit.
   * @returns Nothing.
   */
  run(commitTarget: EyedropperCommitTarget): void {
    this.openEyedropper.execute(commitTarget);
    this.loadEyedropperSnapshot.execute();
  }
}
