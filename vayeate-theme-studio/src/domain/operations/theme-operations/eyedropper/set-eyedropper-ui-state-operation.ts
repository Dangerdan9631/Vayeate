import { injectable } from 'tsyringe';
import type { EyedropperUiState } from '../../../state/eyedropper-ui-state';
import { UiStateSetter } from '../../../state/ui-state-setter';

/** Replace the full `ui.eyedropper` slice. */
@injectable()
export class SetEyedropperUiStateOperation {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  execute(eyedropper: EyedropperUiState): void {
    this.uiStateSetter.apply({ type: 'SET_UI_EYEDROPPER', eyedropper });
  }
}
