import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../../domain/operations/eyedropper-operations/load-eyedropper-snapshot-operation';
import { AppAction } from '../../../core/action-queue/app-action';
import { OpenEyedropperOperation } from '../../../../domain/operations/eyedropper-operations/open-eyedropper-operation';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly openEyedropper: OpenEyedropperOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  run(callbackAction: AppAction): void {
    this.openEyedropper.execute(callbackAction);
    this.loadEyedropperSnapshot.execute();
  }
}
