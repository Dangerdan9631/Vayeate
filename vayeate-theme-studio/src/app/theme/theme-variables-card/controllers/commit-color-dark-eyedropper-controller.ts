import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { SetColorVariableDarkOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';

@singleton()
export class CommitColorDarkEyedropperController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly setColorVariableDark: SetColorVariableDarkOperation,
  ) {}

  run(ref: string): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.setColorVariableDark.execute(ref, eyeDropperResult);
  }
}
