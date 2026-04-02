import { singleton } from 'tsyringe';
import { closedEyedropperUiState } from '../../../state/ui/eyedropper-ui-state';
import { SetEyedropperUiStateOperation } from '../../../operations/theme-operations';

@singleton()
export class CloseEyedropperOverlayController {
  constructor(private readonly setEyedropperUiState: SetEyedropperUiStateOperation) {}

  run(): void {
    this.setEyedropperUiState.execute(closedEyedropperUiState);
  }
}
