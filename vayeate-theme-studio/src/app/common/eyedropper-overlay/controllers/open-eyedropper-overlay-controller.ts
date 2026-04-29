import { singleton } from 'tsyringe';
import { EnqueueBackgroundQueueActionOperation } from '../../../../domain/operations/background-queue/enqueue-background-queue-action-operation';
import { LoadEyedropperSnapshotOperation } from '../../../../domain/operations/eyedropper-operations/load-eyedropper-snapshot-operation';
import { OpenEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/open-eyedropper-operation';
import type { EyedropperCommitTarget } from '../../../../model/eyedropper';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly openEyedropper: OpenEyedropperOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  async run(commitTarget: EyedropperCommitTarget): Promise<void> {
    this.openEyedropper.execute(commitTarget);
    this.enqueueBackgroundAction.execute(
      'Loading eyedropper snapshot',
      () => this.loadEyedropperSnapshot.execute(),
    );
  }
}
