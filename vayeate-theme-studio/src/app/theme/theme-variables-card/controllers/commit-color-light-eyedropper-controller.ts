import { singleton } from 'tsyringe';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { SetColorVariableLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-light-operation';

@singleton()
export class CommitColorLightEyedropperController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly setColorVariableLight: SetColorVariableLightOperation,
  ) {}

  run(ref: string): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.setColorVariableLight.execute(ref, eyeDropperResult);
  }
}
