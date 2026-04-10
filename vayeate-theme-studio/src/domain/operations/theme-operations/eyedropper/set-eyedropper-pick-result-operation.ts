import { singleton } from 'tsyringe';
import type { HexColor } from '../../../../model/schemas';
import { UiStateGetter, UiStateSetter } from '../../../state/ui/ui-state-reducer';

/** Merge `result` into the current `ui.eyedropper` slice (full replace of the slice). */
@singleton()
export class SetEyedropperPickResultOperation {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly uiStateSetter: UiStateSetter,
  ) {}

  execute(hex: HexColor): void {
    const ed = this.uiStateGetter.current().eyedropper;
    this.uiStateSetter.apply({
      type: 'SET_UI_EYEDROPPER',
      eyedropper: { ...ed, result: hex, pendingPostCommit: null },
    });
  }
}
