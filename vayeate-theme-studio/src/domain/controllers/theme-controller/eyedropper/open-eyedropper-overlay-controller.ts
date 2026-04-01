import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshotOperation, SetEyedropperUiStateOperation } from '../../../operations/theme-operations';

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
    });
    await this.loadEyedropperSnapshot.execute(contextKey);
  }
}
