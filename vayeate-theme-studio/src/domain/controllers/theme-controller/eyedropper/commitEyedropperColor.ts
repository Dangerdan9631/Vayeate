import { singleton } from 'tsyringe';
import type { ColorVariableKey, HexColor } from '../../../../model/schemas';
import { CommitAssignColorTextController } from '../palette-color-assign/commitAssignColorText';
import { CommitHueReferenceColorController } from '../palette-hue/commitHueReferenceColor';
import { SetColorVariableDarkController } from '../variables-color/setColorVariableDark';
import { SetColorVariableLightController } from '../variables-color/setColorVariableLight';
import { CloseEyedropperOverlayController } from './closeEyedropperOverlay';

const PREFIX_ASSIGN = 'eyedropper:assign:';
const PREFIX_DARK = 'eyedropper:dark:';
const PREFIX_LIGHT = 'eyedropper:light:';

@singleton()
export class CommitEyedropperColorController {
  constructor(
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitAssignColorText: CommitAssignColorTextController,
    private readonly commitHueReferenceColor: CommitHueReferenceColorController,
    private readonly setColorVariableDark: SetColorVariableDarkController,
    private readonly setColorVariableLight: SetColorVariableLightController,
  ) {}

  /** Apply picked `hex` for the current `contextKey` (same strings as open overlay), then close. */
  run(hex: HexColor, contextKey: string | null): void {
    if (!contextKey) {
      this.closeEyedropperOverlay.run();
      return;
    }
    try {
      if (contextKey === 'eyedropper:hue') {
        this.commitHueReferenceColor.run(hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_ASSIGN)) {
        this.commitAssignColorText.run(hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_DARK)) {
        const ref = contextKey.slice(PREFIX_DARK.length) as ColorVariableKey;
        this.setColorVariableDark.run(ref, hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_LIGHT)) {
        const ref = contextKey.slice(PREFIX_LIGHT.length) as ColorVariableKey;
        this.setColorVariableLight.run(ref, hex);
        return;
      }
    } finally {
      this.closeEyedropperOverlay.run();
    }
  }
}
