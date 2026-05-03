import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../../domain/operations/eyedropper-operations/load-eyedropper-snapshot-operation';
import { OpenEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/open-eyedropper-operation';
import type { EyedropperCommitTarget } from '../../../../model/eyedropper';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly openEyedropper: OpenEyedropperOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  async run(commitTarget: EyedropperCommitTarget): Promise<void> {
    this.openEyedropper.execute(commitTarget);
    await this.loadEyedropperSnapshot.execute();
  }
}
