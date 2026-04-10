import { injectable } from 'tsyringe';
import type { HexColor } from '../../../model/schemas';
import { CancelEyedropperOverlayWorkflowOperation } from '../operations/cancel-eyedropper-overlay-workflow-operation';
import { CommitEyedropperPickWorkflowOperation } from '../operations/commit-eyedropper-pick-workflow-operation';

/** App-shell workflow for eyedropper overlay; delegates to workflow operations only. */
@injectable()
export class EyedropperOverlayWorkflowController {
  constructor(
    private readonly cancelEyedropperOverlayWorkflow: CancelEyedropperOverlayWorkflowOperation,
    private readonly commitEyedropperPickWorkflow: CommitEyedropperPickWorkflowOperation,
  ) {}

  cancelOverlay(): void {
    this.cancelEyedropperOverlayWorkflow.execute();
  }

  commitPick(hex: HexColor): void {
    this.commitEyedropperPickWorkflow.execute(hex);
  }
}
