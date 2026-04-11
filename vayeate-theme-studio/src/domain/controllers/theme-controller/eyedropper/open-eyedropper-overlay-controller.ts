import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation } from '../../../operations/theme-operations/eyedropper/load-eyedropper-snapshot-operation';
import { SetEyedropperUiStateOperation } from '../../../operations/theme-operations/eyedropper/set-eyedropper-ui-state-operation';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly setEyedropperUiState: SetEyedropperUiStateOperation,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshotOperation,
  ) {}

  /** Set loading + context, then load snapshot (ready/error) via `LoadEyedropperSnapshotOperation`. */
  async run(contextKey: string): Promise<void> {
    this.setEyedropperUiState.execute({
      phase: 'loading',
      contextKey,
      snapshot: null,
      errorMessage: null,
      result: null,
      pendingPostCommit: null,
    });
    await this.loadEyedropperSnapshot.execute(contextKey);
  }
}
