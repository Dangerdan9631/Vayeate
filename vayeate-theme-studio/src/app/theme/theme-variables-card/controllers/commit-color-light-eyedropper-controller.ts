import { singleton } from 'tsyringe';
import { SetColorVariableLightController } from './set-color-variable-light-controller';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';

@singleton()
export class CommitColorLightEyedropperController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly setColorVariableLight: SetColorVariableLightController,
  ) {}

  run(ref: string): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.setColorVariableLight.run(ref, eyeDropperResult);
  }
}
