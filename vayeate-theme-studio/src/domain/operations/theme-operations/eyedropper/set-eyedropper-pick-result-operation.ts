import { injectable } from 'tsyringe';
import type { HexColor } from '../../../../model/schemas';
import { UiStateGetter } from '../../../state/ui/ui-state-reducer';
import { SetEyedropperUiStateOperation } from './set-eyedropper-ui-state-operation';

/** Merge `result` into the current `ui.eyedropper` slice (full replace of the slice). */
@injectable()
export class SetEyedropperPickResultOperation {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly setEyedropperUiState: SetEyedropperUiStateOperation,
  ) {}

  execute(hex: HexColor): void {
    const ed = this.uiStateGetter.current().eyedropper;
    this.setEyedropperUiState.execute({ ...ed, result: hex, pendingPostCommit: null });
  }
}
