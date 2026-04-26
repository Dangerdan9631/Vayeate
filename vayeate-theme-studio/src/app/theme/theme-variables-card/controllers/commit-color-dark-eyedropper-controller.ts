import { singleton } from 'tsyringe';
import { SetColorVariableDarkController } from './set-color-variable-dark-controller';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';

@singleton()
export class CommitColorDarkEyedropperController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly setColorVariableDark: SetColorVariableDarkController,
  ) {}

  run(ref: string): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.setColorVariableDark.run(ref, eyeDropperResult);
  }
}
