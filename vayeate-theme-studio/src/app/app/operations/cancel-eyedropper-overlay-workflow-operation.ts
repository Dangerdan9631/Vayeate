import { injectable } from 'tsyringe';
import { SetEyedropperUiStateOperation } from '../../../domain/operations/theme-operations';
import { closedEyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';

/** Replace `ui.eyedropper` with closed slice (includes `pendingPostCommit: null`). */
@injectable()
export class CancelEyedropperOverlayWorkflowOperation {
  constructor(private readonly setEyedropperUiState: SetEyedropperUiStateOperation) {}

  execute(): void {
    this.setEyedropperUiState.execute(closedEyedropperUiState);
  }
}
