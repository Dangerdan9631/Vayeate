import { singleton } from 'tsyringe';
import { LoadEyedropperSnapshot, SetEyedropperUiState } from '../../../operations/theme-operations';

@singleton()
export class OpenEyedropperOverlayController {
  constructor(
    private readonly setEyedropperUiState: SetEyedropperUiState,
    private readonly loadEyedropperSnapshot: LoadEyedropperSnapshot,
  ) {}

  /** Set loading + context, then load snapshot (ready/error) via `LoadEyedropperSnapshot`. */
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
