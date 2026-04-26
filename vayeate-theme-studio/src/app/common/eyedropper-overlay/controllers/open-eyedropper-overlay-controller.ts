import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../../domain/operations/theme-operations/eyedropper/load-eyedropper-snapshot-operation';
import { AppAction } from '../../../core/action-queue/app-action';
import { OpenEyedropperOperation } from '../../../../domain/operations/theme-operations/eyedropper/open-eyedropper-operation';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly openEyedropperOverlay: OpenEyedropperOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  run(callbackAction: AppAction): void {
    this.openEyedropperOverlay.execute(callbackAction);
    this.loadEyedropperSnapshot.execute();
  }
}
