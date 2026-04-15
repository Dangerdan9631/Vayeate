import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schemas';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';

/** Merge `result` into the current `ui.eyedropper` slice (full replace of the slice). */
@singleton()
export class SetEyedropperPickResultOperation {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  execute(hex: HexColor): void {
    const ed = this.eyedropperUiStore.getState().state;
    this.eyedropperUiStore.getState().setState({ ...ed, result: hex, pendingPostCommit: null });
  }
}
