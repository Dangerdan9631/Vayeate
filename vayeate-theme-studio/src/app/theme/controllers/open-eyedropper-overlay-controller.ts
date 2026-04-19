import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../domain/operations/theme-operations/eyedropper/load-eyedropper-snapshot-operation';
import { SetEyedropperUiStateOperation } from '../../../domain/operations/theme-operations/eyedropper/set-eyedropper-ui-state-operation';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly setEyedropperUiState: SetEyedropperUiStateOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  /** Set loading + context, then load snapshot (ready/error) via `LoadEyedropperSnapshotOperation`. */
  run(contextKey: string): void {
    this.setEyedropperUiState.execute({
      phase: 'loading',
      contextKey,
      snapshot: null,
      errorMessage: null,
      result: null,
      pendingPostCommit: null,
    });
    this.loadEyedropperSnapshot.execute(contextKey);
  }
}
