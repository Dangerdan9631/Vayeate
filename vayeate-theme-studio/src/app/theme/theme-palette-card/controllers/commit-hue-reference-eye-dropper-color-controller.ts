import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';

@singleton()
export class CommitHueReferenceEyeDropperColorController {
  constructor(
    private readonly eyeDropperUiStore: EyedropperUiStore,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
  ) {}

  run(): void {
    const eyeDropperResult = this.eyeDropperUiStore.getStore().state.result;
    if (!eyeDropperResult) return;

    this.setThemeHueReferenceHex.execute(eyeDropperResult);
    this.setThemeHueAdjustment.execute(0);
  }
}
