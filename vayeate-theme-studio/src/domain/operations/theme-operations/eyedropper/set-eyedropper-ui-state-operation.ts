import { singleton } from 'tsyringe';
import type { EyedropperUiState } from '../../../state/ui/eyedropper-ui-state';
import { UiStateSetter } from '../../../state/ui/ui-state-reducer';

/** Replace the full `ui.eyedropper` slice. */
@singleton()
export class SetEyedropperUiStateOperation {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  execute(eyedropper: EyedropperUiState): void {
    this.uiStateSetter.apply({ type: 'SET_UI_EYEDROPPER', eyedropper });
  }
}
