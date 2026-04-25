import { singleton } from 'tsyringe';
import { initialEyedropperUiState } from '../../../../domain/state/ui/eyedropper-ui-state';
import { SetEyedropperUiStateOperation } from '../../../../domain/operations/theme-operations/eyedropper/set-eyedropper-ui-state-operation';

@singleton()
export class CloseEyedropperOverlayController {
  constructor(private readonly setEyedropperUiState: SetEyedropperUiStateOperation) {}

  run(): void {
    this.setEyedropperUiState.execute(initialEyedropperUiState);
  }
}
