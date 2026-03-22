import { singleton } from 'tsyringe';
import { closedEyedropperUiState } from '../../../state/eyedropper-ui-state';
import { SetEyedropperUiState } from '../../../operations/theme-operations';

@singleton()
export class CloseEyedropperOverlayController {
  constructor(private readonly setEyedropperUiState: SetEyedropperUiState) {}

  run(): void {
    this.setEyedropperUiState.execute(closedEyedropperUiState);
  }
}
